# Campus Stock Reports Architecture

## Problem Statement

The project solves a CRUD and reporting requirement for the Applications and Trends course. The selected case is a university campus store that needs to manage product inventory and generate a report showing total inventory value and category percentages.

## Main Modules

- `frontend`: React interface built with Vite.
- `backend`: Express API with controller, route, service, and data layers.
- `db`: SQL schema used by the backend-managed SQLite database.

## Data Model

`products`

- `id`
- `name`
- `category`
- `quantity`
- `unit_price`
- `supplier`
- `created_at`
- `updated_at`
- `deleted_at`

The total value is calculated as `quantity * unit_price`.

## Web Services

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/health` | Confirms the API is running. |
| GET | `/api/products` | Lists all products. |
| GET | `/api/products/:id` | Shows one product. |
| POST | `/api/products` | Creates a product. |
| PUT | `/api/products/:id` | Updates a product. |
| DELETE | `/api/products/:id` | Deletes a product. |
| GET | `/api/reports/inventory` | Returns report JSON plus generated XML. |

Product deletion is logical: the API sets `deleted_at` and normal queries ignore those rows.

## Report Flow

1. The backend reads products from SQLite.
2. It calculates total inventory value.
3. It groups products by category.
4. It calculates category percentages.
5. It creates an XML document from the same report data.
6. The frontend parses the XML with `DOMParser` and renders an expandable XML tree.

## Deployment Notes

The backend can be deployed as a Node web service. The frontend can be deployed as a static Vite app. For cloud deployment, set `VITE_API_URL` in the frontend to the public backend URL and set `CLIENT_URL` in the backend to the public frontend URL.
