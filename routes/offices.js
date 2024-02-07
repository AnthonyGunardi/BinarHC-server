const route = require('express').Router();
const { OfficeController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.post('/', OfficeController.create);

module.exports = route;