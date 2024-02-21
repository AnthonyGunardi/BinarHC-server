const route = require('express').Router();
const { EventController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.get('/', authentication, EventController.getAllEvents);
route.get('/:id', authentication, EventController.getEvent);
route.put('/:id', authentication, EventController.update);
route.put('/toggle/:id', authentication, EventController.toggleEvent);

module.exports = route;