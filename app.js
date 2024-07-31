const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./router/tourRouter');
const UserRouter = require('./router/userRouter');
const globlaErrorHandler = require('./Controller/errorController');
const AppError = require('./Utils/appError');

const app = express();

//creating a Middleware
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// app.use((req, res, next) => {
//   console.log('Hello from the middleWare!!!');
//   next();
// });

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// using route handlers from sub files using middlewares
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', UserRouter);

// HANDLING UNHANDLED ROUTES

/* its a middleware func which runs in the order of they defined
so if it find any routes that doesn't match the routehandler above
the middleware below will run handling the unhandled routes */

// the '*' represent all the routes and all method is for any html verbs

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} in this Server!`,
  // });

  // const err = new Error(`Can't find ${req.originalUrl} in this Server!`);
  // err.statusCode = 404;
  // err.status = 'failed!';
  next(new AppError(`Can't find ${req.originalUrl} in this Server!`, 404));
});

app.use(globlaErrorHandler);

module.exports = app;
