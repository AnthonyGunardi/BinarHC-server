const route = require('express').Router();
const { EducationController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');
const adminAuthorization = require('../middlewares/adminAuthorization');

route.post('/', authentication, adminAuthorization, EducationController.create);
route.get('/', authentication, EducationController.getAllEducations); //with query params, example: ?lastID=36&limit=5&key=lorem
route.get('/:slug', EducationController.getEducation);
route.put('/toggle/:slug', authentication, adminAuthorization, EducationController.toggleEducation);
route.put('/:slug', authentication, adminAuthorization, EducationController.update);

module.exports = route;