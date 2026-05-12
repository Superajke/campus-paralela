import React from "react";
import { RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";
import ProductForm from "../components/ProductForm.jsx";
import ProductTable from "../components/ProductTable.jsx";
import XmlTree from "../components/XmlTree.jsx";

const emptyProduct = {
  name: "",
  category: "",
  quantity: 0,
  unitPrice: 0,
  supplier: ""
};

const categoryLabels = {
  Electronics: "Electrónica",
  Stationery: "Papelería",
  Laboratory: "Laboratorio",
  Accessories: "Accesorios"
};

const errorLabels = {
  "Name is required.": "El nombre es obligatorio.",
  "Category is required.": "La categoría es obligatoria.",
  "Supplier is required.": "El proveedor es obligatorio.",
  "Quantity must be a whole number greater than or equal to zero.": "La cantidad debe ser un número entero mayor o igual a cero.",
  "Unit price must be greater than or equal to zero.": "El precio unitario debe ser mayor o igual a cero."
};

function translateErrors(apiErrors) {
  return Object.fromEntries(
    Object.entries(apiErrors).map(([field, message]) => [field, errorLabels[message] ?? message])
  );
}

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [report, setReport] = useState(null);
  const [draft, setDraft] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("Cargando datos...");

  async function loadData() {
    const [productData, reportData] = await Promise.all([api.listProducts(), api.getReport()]);
    setProducts(productData);
    setReport(reportData);
    setStatus("");
  }

  useEffect(() => {
    loadData().catch(() => setStatus("No se pudo conectar con la API."));
  }, []);

  const topCategory = useMemo(() => {
    if (!report?.categories?.length) return "Sin categoría";
    const category = [...report.categories].sort((a, b) => b.value - a.value)[0].name;
    return categoryLabels[category] ?? category;
  }, [report]);

  function updateDraft(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function submitProduct(event) {
    event.preventDefault();
    setErrors({});
    try {
      if (editingId) {
        await api.updateProduct(editingId, draft);
      } else {
        await api.createProduct(draft);
      }
      setDraft(emptyProduct);
      setEditingId(null);
      await loadData();
    } catch (error) {
      setErrors(translateErrors(error.data?.errors ?? {}));
    }
  }

  function editProduct(product) {
    setEditingId(product.id);
    setDraft({
      name: product.name,
      category: product.category,
      quantity: product.quantity,
      unitPrice: product.unitPrice,
      supplier: product.supplier
    });
  }

  async function removeProduct(id) {
    await api.deleteProduct(id);
    await loadData();
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(emptyProduct);
    setErrors({});
  }

  return (
    <main>
      <header className="app-header">
        <div>
          <p className="eyebrow">Aplicaciones y Tendencias</p>
          <h1>Reportes de Inventario Universitario</h1>
        </div>
        <button className="secondary-button" type="button" onClick={loadData}>
          <RefreshCw size={18} />
          Actualizar
        </button>
      </header>

      {status && <p className="status">{status}</p>}

      <section className="metrics-band">
        <article>
          <span>Valor total</span>
          <strong>${(report?.totalValue ?? 0).toFixed(2)}</strong>
        </article>
        <article>
          <span>Productos</span>
          <strong>{report?.totalProducts ?? products.length}</strong>
        </article>
        <article>
          <span>Categoría principal</span>
          <strong>{topCategory}</strong>
        </article>
      </section>

      <div className="workspace">
        <ProductForm
          draft={draft}
          errors={errors}
          editing={Boolean(editingId)}
          onCancel={cancelEdit}
          onChange={updateDraft}
          onSubmit={submitProduct}
        />
        <ProductTable products={products} onEdit={editProduct} onDelete={removeProduct} />
      </div>

      <section className="report-grid">
        <div className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Porcentajes</p>
              <h2>Reporte por categoría</h2>
            </div>
          </div>
          <div className="category-list">
            {(report?.categories ?? []).map((category) => (
              <article key={category.name}>
                <div>
                  <strong>{categoryLabels[category.name] ?? category.name}</strong>
                  <span>${category.value.toFixed(2)}</span>
                </div>
                <div className="bar">
                  <span style={{ width: `${category.percentage}%` }} />
                </div>
                <small>{category.percentage.toFixed(2)}%</small>
              </article>
            ))}
          </div>
        </div>

        <div className="panel xml-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Lectura XML</p>
              <h2>Árbol del reporte</h2>
            </div>
          </div>
          <XmlTree xml={report?.xml} />
        </div>
      </section>
    </main>
  );
}
