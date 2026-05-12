import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";

process.env.NODE_ENV = "test";
process.env.SEED_DATABASE = "false";
process.env.DB_PATH = join(mkdtempSync(join(tmpdir(), "campus-stock-test-")), "test.db");

const { default: app } = await import("../src/app.js");
const { store } = await import("../src/data/database.js");

function listen() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => resolve(server));
  });
}

async function request(server, path, options = {}) {
  const url = `http://127.0.0.1:${server.address().port}${path}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });
  const body = await response.json();
  return { response, body };
}

test("product CRUD, validation, logical delete, and inventory report", async (t) => {
  const server = await listen();
  t.after(() => {
    server.close();
    store.close();
  });

  await t.test("rejects invalid input values", async () => {
    const { response, body } = await request(server, "/api/products", {
      method: "POST",
      body: JSON.stringify({
        name: "",
        category: "",
        quantity: -3,
        unitPrice: -1,
        supplier: ""
      })
    });

    assert.equal(response.status, 422);
    assert.equal(body.errors.name, "Name is required.");
    assert.equal(body.errors.category, "Category is required.");
    assert.equal(body.errors.quantity, "Quantity must be a whole number greater than or equal to zero.");
    assert.equal(body.errors.unitPrice, "Unit price must be greater than or equal to zero.");
    assert.equal(body.errors.supplier, "Supplier is required.");
  });

  let productId;

  await t.test("creates and trims a valid product", async () => {
    const { response, body } = await request(server, "/api/products", {
      method: "POST",
      body: JSON.stringify({
        name: "  Kit de laboratorio  ",
        category: "Laboratorio",
        quantity: 5,
        unitPrice: 20,
        supplier: "  Proveedor Central  "
      })
    });

    assert.equal(response.status, 201);
    assert.equal(body.name, "Kit de laboratorio");
    assert.equal(body.supplier, "Proveedor Central");
    assert.equal(body.totalValue, 100);
    productId = body.id;
  });

  await t.test("updates an existing product", async () => {
    const { response, body } = await request(server, `/api/products/${productId}`, {
      method: "PUT",
      body: JSON.stringify({
        name: "Kit de laboratorio avanzado",
        category: "Laboratorio",
        quantity: 3,
        unitPrice: 45.5,
        supplier: "Proveedor Central"
      })
    });

    assert.equal(response.status, 200);
    assert.equal(body.name, "Kit de laboratorio avanzado");
    assert.equal(body.totalValue, 136.5);
  });

  await t.test("returns report totals, percentages, and XML", async () => {
    const { response, body } = await request(server, "/api/reports/inventory");

    assert.equal(response.status, 200);
    assert.equal(body.totalProducts, 1);
    assert.equal(body.totalValue, 136.5);
    assert.equal(body.categories[0].percentage, 100);
    assert.match(body.xml, /<inventoryReport/);
    assert.match(body.xml, /<totalValue>136\.50<\/totalValue>/);
  });

  await t.test("deletes products logically", async () => {
    const deleted = await request(server, `/api/products/${productId}`, { method: "DELETE" });
    assert.equal(deleted.response.status, 200);

    const hidden = await request(server, `/api/products/${productId}`);
    assert.equal(hidden.response.status, 404);

    const listed = await request(server, "/api/products");
    assert.equal(listed.response.status, 200);
    assert.deepEqual(listed.body, []);

    const row = await store.getDeletedAt(productId);
    assert.ok(row.deletedAt);
  });
});
