//external package
const createError = require("http-errors");
//404 - not founder handler
function notFoundError(req, res, next) {
  next(createError(404, "Your requested content not found!"));
}

//default error handler
function defalutErrorHandler(err, req, res, next) {
  const error =
    process.env.NODE_ENV === "development" ? err : { message: err.message };
  res.status(err.status || 500).json({
    status: err.status,
    errors: {
      common: {
        error,
      },
    },
  });
}

module.exports = {
  notFoundError,
  defalutErrorHandler,
};
