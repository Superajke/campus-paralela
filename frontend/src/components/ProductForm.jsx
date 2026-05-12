import { Save, X } from "lucide-react";
import React from "react";

const emptyProduct = {
  name: "",
  category: "",
  quantity: 0,
  unitPrice: 0,
  supplier: ""
};

export default function ProductForm({ draft, errors, onChange, onSubmit, onCancel, editing }) {
  const product = draft ?? emptyProduct;

  return (
    <form className="panel form-panel" onSubmit={onSubmit}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Formulario de inventario</p>
          <h2>{editing ? "Editar producto" : "Nuevo producto"}</h2>
        </div>
        {editing && (
          <button className="icon-button" type="button" onClick={onCancel} title="Cancelar edición">
            <X size={18} />
          </button>
        )}
      </div>

      <label>
        Nombre
        <input value={product.name} onChange={(event) => onChange("name", event.target.value)} />
        {errors.name && <span>{errors.name}</span>}
      </label>

      <label>
        Categoría
        <input value={product.category} onChange={(event) => onChange("category", event.target.value)} />
        {errors.category && <span>{errors.category}</span>}
      </label>

      <div className="form-grid">
        <label>
          Cantidad
          <input
            type="number"
            min="0"
            value={product.quantity}
            onChange={(event) => onChange("quantity", event.target.value)}
          />
          {errors.quantity && <span>{errors.quantity}</span>}
        </label>

        <label>
          Precio unitario
          <input
            type="number"
            min="0"
            step="0.01"
            value={product.unitPrice}
            onChange={(event) => onChange("unitPrice", event.target.value)}
          />
          {errors.unitPrice && <span>{errors.unitPrice}</span>}
        </label>
      </div>

      <label>
        Proveedor
        <input value={product.supplier} onChange={(event) => onChange("supplier", event.target.value)} />
        {errors.supplier && <span>{errors.supplier}</span>}
      </label>

      <button className="primary-button" type="submit">
        <Save size={18} />
        {editing ? "Guardar cambios" : "Crear producto"}
      </button>
    </form>
  );
}
