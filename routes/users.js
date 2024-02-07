const route = require('express').Router();
const { UserController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.get('/', authentication, UserController.findAllUser); // with query params ?role=participant / admin 
route.post('/register', UserController.register);
// route.post('/registeradmin', UserController.registerAdmin);
route.post('/login', UserController.login);
// route.get('/:id', UserController.findUserById);

module.exports = route;