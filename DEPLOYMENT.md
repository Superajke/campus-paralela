# Cloud Deployment Guide

This project is prepared for Render because it can host:

- a Node/Express backend,
- a static React frontend,
- a managed Postgres database.

The backend uses SQLite locally. In the cloud, when `DATABASE_URL` exists, it automatically switches to Postgres.

## 1. Push the project to GitHub

Create a GitHub repository and push this folder.

Do not upload `node_modules`, `.env`, or local `.db` files. They are already ignored by `.gitignore`.

## 2. Deploy with Render Blueprint

1. Open Render.
2. Go to **New > Blueprint**.
3. Connect the GitHub repository.
4. Select the `render.yaml` file from the root of the repository.
5. Render will create:
   - `campus-stock-api`
   - `campus-stock-frontend`
   - `campus-stock-db`

## 3. Environment variables

During Blueprint creation, Render will ask for these values:

### Backend: `CLIENT_URL`

Use the final frontend URL, for example:

```env
https://campus-stock-frontend.onrender.com
```

If you do not know it yet, deploy once, copy the frontend URL, then update the backend environment variable and redeploy the backend.

### Frontend: `VITE_API_URL`

Use the final backend API URL with `/api` at the end:

```env
https://campus-stock-api.onrender.com/api
```

After setting this variable, redeploy the frontend so Vite includes it in the build.

## 4. Verify after deployment

Open:

```text
https://campus-stock-api.onrender.com/api/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "campus-stock-api"
}
```

Then open the frontend URL and test:

- create a product,
- edit it,
- delete it,
- check that the XML report and percentages update.

## Notes

Free Render web services can sleep after inactivity, so the first request can take about a minute. The database is managed Postgres, so app data is not stored in the backend filesystem.
