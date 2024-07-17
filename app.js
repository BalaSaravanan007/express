const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./router/tourRouter');
const UserRouter = require('./router/userRouter');

const app = express();

//creating a Middleware
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use((req, res, next) => {
  console.log('Hello from the middleWare!!!');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// using route handlers from sub files using middlewares
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', UserRouter);

module.exports = app;
