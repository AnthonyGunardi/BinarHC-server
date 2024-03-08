const route = require('express').Router();
const { PointController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');
const adminAuthorization = require('../middlewares/adminAuthorization');

route.put('/:nip', authentication, adminAuthorization, PointController.modify);

module.exports = route;