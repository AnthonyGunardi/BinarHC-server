const route = require('express').Router();
const { PointLogController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');
const adminAuthorization = require('../middlewares/adminAuthorization');

route.get('/', authentication, adminAuthorization, PointLogController.getPointLogs);
route.get('/scroll', authentication, adminAuthorization, PointLogController.getPointLogsByScroll); //with query params, example: ?lastID=36&limit=5&key=lorem
route.get('/:nip', authentication, PointLogController.getUserLogsByScroll); //with query params, example: ?lastID=36&limit=5

module.exports = route;