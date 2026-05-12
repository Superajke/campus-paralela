import { listProducts } from "./productService.js";

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export async function buildInventoryReport() {
  const products = await listProducts();
  const totalValue = products.reduce((sum, item) => sum + item.totalValue, 0);
  const categoryMap = new Map();

  products.forEach((product) => {
    const current = categoryMap.get(product.category) ?? { name: product.category, value: 0, items: 0 };
    current.value += product.totalValue;
    current.items += product.quantity;
    categoryMap.set(product.category, current);
  });

  const categories = [...categoryMap.values()].map((category) => ({
    ...category,
    value: Number(category.value.toFixed(2)),
    percentage: totalValue === 0 ? 0 : Number(((category.value / totalValue) * 100).toFixed(2))
  }));

  const generatedAt = new Date().toISOString();
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<inventoryReport generatedAt="${generatedAt}">`,
    `  <summary>`,
    `    <totalProducts>${products.length}</totalProducts>`,
    `    <totalValue>${totalValue.toFixed(2)}</totalValue>`,
    `  </summary>`,
    `  <categories>`,
    ...categories.map((category) => [
      `    <category name="${escapeXml(category.name)}">`,
      `      <items>${category.items}</items>`,
      `      <value>${category.value.toFixed(2)}</value>`,
      `      <percentage>${category.percentage.toFixed(2)}</percentage>`,
      `    </category>`
    ].join("\n")),
    `  </categories>`,
    `  <products>`,
    ...products.map((product) => [
      `    <product id="${product.id}">`,
      `      <name>${escapeXml(product.name)}</name>`,
      `      <category>${escapeXml(product.category)}</category>`,
      `      <quantity>${product.quantity}</quantity>`,
      `      <unitPrice>${product.unitPrice.toFixed(2)}</unitPrice>`,
      `      <totalValue>${product.totalValue.toFixed(2)}</totalValue>`,
      `      <supplier>${escapeXml(product.supplier)}</supplier>`,
      `    </product>`
    ].join("\n")),
    `  </products>`,
    `</inventoryReport>`
  ].join("\n");

  return {
    generatedAt,
    totalProducts: products.length,
    totalValue: Number(totalValue.toFixed(2)),
    categories,
    products,
    xml
  };
}
