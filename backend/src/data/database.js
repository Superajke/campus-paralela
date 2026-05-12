import { DatabaseSync } from "node:sqlite";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = __dirname;
const databasePath = process.env.DB_PATH ?? join(dataDir, "campus-stock.db");
const schemaPath = join(__dirname, "../../../db/schema.sql");

const seedProducts = [
  ["Scientific calculator", "Electronics", 18, 32.5, "EduTech Supplies"],
  ["Lab notebook", "Stationery", 60, 4.75, "PaperLine"],
  ["USB-C cable", "Electronics", 35, 8.99, "CablePoint"],
  ["Safety goggles", "Laboratory", 24, 12.4, "LabCare"],
  ["Reusable bottle", "Accessories", 28, 9.5, "Campus Goods"]
];

function mapProduct(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    quantity: row.quantity,
    unitPrice: Number(row.unitPrice ?? row.unit_price),
    supplier: row.supplier,
    totalValue: Number(row.totalValue ?? row.total_value),
    createdAt: row.createdAt ?? row.created_at,
    updatedAt: row.updatedAt ?? row.updated_at,
    deletedAt: row.deletedAt ?? row.deleted_at
  };
}

function createSqliteStore() {
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  const db = new DatabaseSync(databasePath);
  db.exec(readFileSync(schemaPath, "utf8"));

  const columns = db.prepare("PRAGMA table_info(products)").all().map((column) => column.name);
  if (!columns.includes("deleted_at")) {
    db.exec("ALTER TABLE products ADD COLUMN deleted_at TEXT");
  }

  const count = db.prepare("SELECT COUNT(*) AS total FROM products WHERE deleted_at IS NULL").get().total;
  if (count === 0 && process.env.SEED_DATABASE !== "false") {
    const insert = db.prepare(`
      INSERT INTO products (name, category, quantity, unit_price, supplier)
      VALUES (?, ?, ?, ?, ?)
    `);
    seedProducts.forEach((product) => insert.run(...product));
  }

  const productSelect = `
    SELECT
      id,
      name,
      category,
      quantity,
      unit_price AS unitPrice,
      supplier,
      ROUND(quantity * unit_price, 2) AS totalValue,
      created_at AS createdAt,
      updated_at AS updatedAt,
      deleted_at AS deletedAt
    FROM products
  `;

  return {
    raw: db,
    async listProducts() {
      return db.prepare(`${productSelect} WHERE deleted_at IS NULL ORDER BY category, name`).all().map(mapProduct);
    },
    async getProduct(id) {
      const row = db.prepare(`${productSelect} WHERE id = ? AND deleted_at IS NULL`).get(id);
      return row ? mapProduct(row) : undefined;
    },
    async createProduct(payload) {
      const result = db.prepare(`
        INSERT INTO products (name, category, quantity, unit_price, supplier)
        VALUES (?, ?, ?, ?, ?)
      `).run(payload.name.trim(), payload.category.trim(), payload.quantity, payload.unitPrice, payload.supplier.trim());
      return this.getProduct(result.lastInsertRowid);
    },
    async updateProduct(id, payload) {
      db.prepare(`
        UPDATE products
        SET name = ?, category = ?, quantity = ?, unit_price = ?, supplier = ?
        WHERE id = ? AND deleted_at IS NULL
      `).run(payload.name.trim(), payload.category.trim(), payload.quantity, payload.unitPrice, payload.supplier.trim(), id);
      return this.getProduct(id);
    },
    async deleteProduct(id) {
      const product = await this.getProduct(id);
      if (!product) return null;
      db.prepare("UPDATE products SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?").run(id);
      return product;
    },
    async getDeletedAt(id) {
      return db.prepare("SELECT deleted_at AS deletedAt FROM products WHERE id = ?").get(id);
    },
    async close() {
      db.close();
    }
  };
}

function createPostgresStore() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSLMODE === "disable" ? false : { rejectUnauthorized: false }
  });

  const ready = (async () => {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
        supplier TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      )
    `);

    const count = await pool.query("SELECT COUNT(*)::int AS total FROM products WHERE deleted_at IS NULL");
    if (count.rows[0].total === 0 && process.env.SEED_DATABASE !== "false") {
      await Promise.all(seedProducts.map((product) => pool.query(
        "INSERT INTO products (name, category, quantity, unit_price, supplier) VALUES ($1, $2, $3, $4, $5)",
        product
      )));
    }
  })();

  const productSelect = `
    SELECT
      id,
      name,
      category,
      quantity,
      unit_price,
      supplier,
      ROUND(quantity * unit_price, 2)::float AS total_value,
      created_at,
      updated_at,
      deleted_at
    FROM products
  `;

  async function query(sql, params = []) {
    await ready;
    return pool.query(sql, params);
  }

  return {
    raw: pool,
    ready,
    async listProducts() {
      const result = await query(`${productSelect} WHERE deleted_at IS NULL ORDER BY category, name`);
      return result.rows.map(mapProduct);
    },
    async getProduct(id) {
      const result = await query(`${productSelect} WHERE id = $1 AND deleted_at IS NULL`, [id]);
      return result.rows[0] ? mapProduct(result.rows[0]) : undefined;
    },
    async createProduct(payload) {
      const result = await query(`
        INSERT INTO products (name, category, quantity, unit_price, supplier)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, [payload.name.trim(), payload.category.trim(), payload.quantity, payload.unitPrice, payload.supplier.trim()]);
      return this.getProduct(result.rows[0].id);
    },
    async updateProduct(id, payload) {
      await query(`
        UPDATE products
        SET name = $1, category = $2, quantity = $3, unit_price = $4, supplier = $5, updated_at = NOW()
        WHERE id = $6 AND deleted_at IS NULL
      `, [payload.name.trim(), payload.category.trim(), payload.quantity, payload.unitPrice, payload.supplier.trim(), id]);
      return this.getProduct(id);
    },
    async deleteProduct(id) {
      const product = await this.getProduct(id);
      if (!product) return null;
      await query("UPDATE products SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1", [id]);
      return product;
    },
    async getDeletedAt(id) {
      const result = await query("SELECT deleted_at AS \"deletedAt\" FROM products WHERE id = $1", [id]);
      return result.rows[0];
    },
    async close() {
      await pool.end();
    }
  };
}

export const store = process.env.DATABASE_URL ? createPostgresStore() : createSqliteStore();
export const db = store.raw;
export const dbReady = store.ready ?? Promise.resolve();
