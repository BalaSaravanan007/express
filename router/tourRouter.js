const express = require('express');
const tourController = require('./../Controller/tourController');

const Router = express.Router();

Router.param('id', tourController.checkID);

Router.route('/')
  .get(tourController.GetAllTour)
  .post(tourController.checkBody, tourController.CreateNewTour);

Router.route('/:id')
  .get(tourController.GetTour)
  .patch(tourController.UpdateTour)
  .delete(tourController.DeleteTour);

module.exports = Router;
