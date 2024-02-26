const route = require('express').Router();
const { UserController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.get('/', authentication, UserController.findAllUser);
route.post('/register', UserController.register);
route.post('/login', UserController.login);
route.post('/adminlogin', UserController.adminLogin);
route.post('/superadmlogin', UserController.SuperAdminLogin);

module.exports = route;
