// GLOBAL ERROR HANDLING MIDDLEWARE

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    // 1) Operational err: we can send details about the error to the user
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // 2) Programming err: we don't need
    console.error('ERROR: 💥', err);

    res.status(500).json({
      status: 'error 💥',
      message: 'Something went very wrong!! 😥',
    });
  }
};

module.exports = (err, req, res, next) => {
  console.log(err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV == 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV == 'production') {
    sendErrorProd(err, res);
  }
};
