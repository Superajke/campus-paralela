# Campus Stock Reports

Project for **Applications and Trends**. It follows the same general organization as the reference project: separated `backend`, `frontend`, and `db` folders, with Express web services and a React interface.

## Statement

Campus Stock Reports is a small inventory control system for a university store. It allows an administrator to create, read, update, and delete products, then generate a report that shows:

- the report as an XML tree,
- the total inventory value,
- the percentage represented by each product category.

## Architecture

- **Frontend:** React + Vite.
- **Backend:** Express REST API.
- **Database:** SQLite managed by the backend through Node's built-in `node:sqlite` module.
- **Reports:** The backend builds JSON summary data and transforms it into XML. The frontend parses that XML and renders the tree visually.

## Run locally

```bash
npm.cmd run install:all
npm.cmd run dev
```

Open `http://localhost:5173`.

The API runs on `http://localhost:4000`.

## Tests

```bash
npm.cmd --prefix backend test
```

The backend tests cover input validation, create/update/list flows, report totals, XML generation, and logical deletes.

## Main web services

- `GET /api/products`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/reports/inventory`

The delete service uses a logical delete through `deleted_at`, so removed products are hidden from the app and reports without being physically erased from the database.

## Cloud deployment

The app is ready for Render using `render.yaml`.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full cloud deployment guide.

For local class demos, SQLite is stored in `backend/src/data/campus-stock.db`. In cloud, the backend uses Postgres automatically when `DATABASE_URL` is configured.
