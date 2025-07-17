const route = require('express').Router();
const { SubEducationController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');
const adminAuthorization = require('../middlewares/adminAuthorization');

route.post('/', authentication, adminAuthorization, SubEducationController.create);
route.get('/', authentication, SubEducationController.getAllSubEducations); //with query params, example: ?education_id=1(optional)
route.get('/:slug', SubEducationController.getSubEducation);
route.put('/toggle/:slug', authentication, adminAuthorization, SubEducationController.toggleSubEducation);
route.put('/:slug', authentication, adminAuthorization, SubEducationController.update);

module.exports = route;