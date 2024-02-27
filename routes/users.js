const route = require('express').Router();
const { UserController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.get('/employees', authentication, UserController.findAllEmployees);
route.get('/admins', authentication, UserController.findAllAdmins);
route.post('/register', UserController.register);
route.post('/login', UserController.login);
route.post('/adminlogin', UserController.adminLogin);

module.exports = route;
