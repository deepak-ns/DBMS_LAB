const notFoundHandler = (req, res) => {
  res.status(404).send(`Route not found: ${req.method} ${req.originalUrl}`);
};

const errorHandler = (error, _req, res, _next) => {
  console.error(error);
  const status = error.status || 500;
  const message = error.message || "Internal server error";
  res.status(status).send(message);
};

module.exports = { notFoundHandler, errorHandler };
