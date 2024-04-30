const route = require('express').Router();
const { PointLogController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.get('/', authentication, PointLogController.getPointLogs);
route.get('/scroll', authentication, PointLogController.getPointLogsByScroll); //with query params, example: ?lastID=36&limit=5&key=lorem

module.exports = route;