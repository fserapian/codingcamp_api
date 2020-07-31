const ErrorResponse = require('../utils/ErrorResponse');

const errorHandler = (err, req, res, next) => {
  let error = Object.assign({}, err);
  error.message = err.message;

  console.log('err->', err);
  console.log('err.name->', err.name);
  console.log('err.errors->', err.errors);

  if (err.name === 'CastError') {
    error = new ErrorResponse(`Cannot find resource`, 404);
  }

  if (err.code === 11000) {
    error = new ErrorResponse(`Cannot have duplicates`, 400);
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    console.log("It's a validation error");
    error = new ErrorResponse(messages, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Something went wrong!',
  });
};

module.exports = errorHandler;
