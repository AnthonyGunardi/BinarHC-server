const route = require('express').Router();
const { UserEducationController }  = require('../controllers');
const authentication = require('../middlewares/userAuthentication');
const adminAuthorization = require('../middlewares/adminAuthorization');

route.post('/', authentication, adminAuthorization, UserEducationController.create);
route.get('/:id', authentication, UserEducationController.getUserEducations);
route.put('/:id', authentication, adminAuthorization, UserEducationController.update);

module.exports = route;