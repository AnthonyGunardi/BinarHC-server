const route = require('express').Router();
const { EducationRequestController }  = require('../controllers');
const authentication = require('../middlewares/userAuthentication');
const adminAuthorization = require('../middlewares/adminAuthorization');

route.post('/', authentication, EducationRequestController.create);
route.get('/pending', authentication, adminAuthorization, EducationRequestController.getAllPendingRequests);
route.put('/:id', authentication, adminAuthorization, EducationRequestController.update);

module.exports = route;