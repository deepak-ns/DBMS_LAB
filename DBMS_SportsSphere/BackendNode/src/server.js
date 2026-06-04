require("dotenv").config();

const app = require("./app");
const { prisma } = require("./config/prisma");

const port = Number(process.env.PORT || 8080);

const server = app.listen(port, () => {
  console.log(`SportsSphere Node backend running on http://localhost:${port}`);
});

const shutdown = async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
