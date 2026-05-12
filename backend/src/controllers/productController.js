import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct
} from "../services/productService.js";

function validateProduct(payload) {
  const errors = {};

  if (!payload.name?.trim()) errors.name = "Name is required.";
  if (!payload.category?.trim()) errors.category = "Category is required.";
  if (!payload.supplier?.trim()) errors.supplier = "Supplier is required.";
  if (!Number.isInteger(Number(payload.quantity)) || Number(payload.quantity) < 0) {
    errors.quantity = "Quantity must be a whole number greater than or equal to zero.";
  }
  if (Number.isNaN(Number(payload.unitPrice)) || Number(payload.unitPrice) < 0) {
    errors.unitPrice = "Unit price must be greater than or equal to zero.";
  }

  return {
    errors,
    value: {
      name: payload.name ?? "",
      category: payload.category ?? "",
      supplier: payload.supplier ?? "",
      quantity: Number(payload.quantity),
      unitPrice: Number(payload.unitPrice)
    }
  };
}

export async function index(_req, res, next) {
  try {
    res.json(await listProducts());
  } catch (error) {
    next(error);
  }
}

export async function show(req, res, next) {
  try {
    const product = await getProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }
    return res.json(product);
  } catch (error) {
    next(error);
  }
}

export async function store(req, res, next) {
  const validation = validateProduct(req.body);
  if (Object.keys(validation.errors).length > 0) {
    return res.status(422).json({ errors: validation.errors });
  }
  try {
    return res.status(201).json(await createProduct(validation.value));
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    if (!(await getProduct(req.params.id))) {
      return res.status(404).json({ message: "Product not found." });
    }
    const validation = validateProduct(req.body);
    if (Object.keys(validation.errors).length > 0) {
      return res.status(422).json({ errors: validation.errors });
    }
    return res.json(await updateProduct(req.params.id, validation.value));
  } catch (error) {
    next(error);
  }
}

export async function destroy(req, res, next) {
  try {
    const product = await deleteProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }
    return res.json(product);
  } catch (error) {
    next(error);
  }
}
