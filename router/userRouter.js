const express = require('express');
const userController = require('./../Controller/userController');

const Router = express.Router();

Router.route('/')
  .get(userController.GetAllUsers)
  .post(userController.CreateNewUser);

Router.route('/:id')
  .get(userController.GetUser)
  .patch(userController.UpdateUser)
  .delete(userController.DeleteUser);

module.exports = Router;
