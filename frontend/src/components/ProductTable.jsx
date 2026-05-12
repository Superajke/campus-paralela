import { Edit2, Trash2 } from "lucide-react";
import React from "react";

const categoryLabels = {
  Electronics: "Electrónica",
  Stationery: "Papelería",
  Laboratory: "Laboratorio",
  Accessories: "Accesorios"
};

export default function ProductTable({ products, onEdit, onDelete }) {
  return (
    <section className="panel table-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Registros CRUD</p>
          <h2>Productos</h2>
        </div>
        <strong>{products.length} elementos</strong>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Cant.</th>
              <th>Unidad</th>
              <th>Total</th>
              <th>Proveedor</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{categoryLabels[product.category] ?? product.category}</td>
                <td>{product.quantity}</td>
                <td>${product.unitPrice.toFixed(2)}</td>
                <td>${product.totalValue.toFixed(2)}</td>
                <td>{product.supplier}</td>
                <td className="actions">
                  <button className="icon-button" type="button" onClick={() => onEdit(product)} title="Editar producto">
                    <Edit2 size={17} />
                  </button>
                  <button className="icon-button danger" type="button" onClick={() => onDelete(product.id)} title="Eliminar producto">
                    <Trash2 size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
