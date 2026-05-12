import app from "./app.js";

const port = process.env.PORT ?? 4000;

const server = app.listen(port, () => {
  console.log(`Campus Stock API running on http://localhost:${port}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Stop the other server or set a different PORT value.`);
    process.exit(1);
  }

  throw error;
});
