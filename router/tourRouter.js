const express = require('express');
const tourController = require('./../Controller/tourController');

const Router = express.Router();

// Router.param('id', tourController.checkID);

// when user route to this url we first run the middleware function followed by the GetAllTour function
Router.route('/top-5-cheap').get(
  tourController.topCheapTours,
  tourController.GetAllTour
);

Router.route('/')
  .get(tourController.GetAllTour)
  .post(tourController.CreateNewTour);

Router.route('/:id')
  .get(tourController.GetTour)
  .patch(tourController.UpdateTour)
  .delete(tourController.DeleteTour);

module.exports = Router;
