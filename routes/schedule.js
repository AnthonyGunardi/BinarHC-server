const route = require('express').Router();
const { ScheduleController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');
const adminAuthorization = require('../middlewares/adminAuthorization');

route.post('/', authentication, adminAuthorization, ScheduleController.create);
route.get('/', authentication, ScheduleController.getAllSchedules); //with query params, example: ?education_id=1(optional)
route.get('/:slug', ScheduleController.getSchedule);
route.put('/toggle/:slug', authentication, adminAuthorization, ScheduleController.toggleSchedule);
route.put('/:slug', authentication, adminAuthorization, ScheduleController.update);

module.exports = route;