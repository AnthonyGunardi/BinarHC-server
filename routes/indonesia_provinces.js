const route = require('express').Router();
const { ProvinceController} = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.get('/', ProvinceController.getAllProvinces);
// route.get('/:id', authentication, EventController.getEvent);
// route.put('/:id', authentication, EventController.update);
// route.put('/toggle/:id', authentication, EventController.toggleEvent);

module.exports = route;