const route = require('express').Router();
const { MissionController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');
const adminAuthorization = require('../middlewares/adminAuthorization');

route.post('/', authentication, adminAuthorization, MissionController.create);
route.get('/', authentication, MissionController.getAllMissions); //with query params, example: ?is_active=true
// route.get('/scroll', authentication, MissionController.getMissionsByScroll); //with query params, example: ?lastID=36&limit=5&key=lorem
// route.get('/:slug', MissionController.getMission);
// route.put('/toggle/:slug', authentication, adminAuthorization, MissionController.toggleMission);
// route.put('/:slug', authentication, adminAuthorization, MissionController.update);

module.exports = route;