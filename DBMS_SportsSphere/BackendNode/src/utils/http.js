const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const httpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

module.exports = { asyncHandler, httpError };
