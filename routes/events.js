const route = require('express').Router();
const { EventController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');
const adminAuthorization = require('../middlewares/adminAuthorization');

route.post('/:slug', authentication, adminAuthorization, EventController.create);
route.get('/', authentication, EventController.getAllEvents);
route.get('/:slug', authentication, EventController.getEventBySlug);
route.put('/:id', authentication, adminAuthorization, EventController.update);
route.put('/toggle/:id', authentication, adminAuthorization, EventController.toggleEvent);

module.exports = route;