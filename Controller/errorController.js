const AppError = require('./../Utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.value} for ${err.path}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  // console.log(err.keyValue.name);
  const message = `Duplicate Key '${err.keyValue.name}' already exists!!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
  // console.log(err.message);
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    // 1) Operational err: we can send details about the error to the user.
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // 2) Programming err: we don't need to send any information to the user.
    console.error('ERROR: 💥', err);

    res.status(500).json({
      status: 'error 💥',
      message: 'Something went very wrong!! 😥',
    });
  }
};

// GLOBAL ERROR HANDLING MIDDLEWARE

module.exports = (err, req, res, next) => {
  //console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV == 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV == 'production') {
    let error = { ...err };

    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    // console.log(err);

    sendErrorProd(error, res);
  }
};
