const route = require('express').Router();
const { EventController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.post('/:slug', authentication, EventController.create);
route.get('/', authentication, EventController.getAllEvents);
route.get('/:slug', authentication, EventController.getEventBySlug);
route.put('/:id', authentication, EventController.update);
route.put('/toggle/:id', authentication, EventController.toggleEvent);

module.exports = route;