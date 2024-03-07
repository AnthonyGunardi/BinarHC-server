const route = require('express').Router();
const { UserController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.get('/employees', authentication, UserController.findAllEmployees);
route.put('/employee/reset/:email', authentication, UserController.resetEmployeePassword);
route.post('/employee/login', UserController.employeeLogin);
route.get('/admins', authentication, UserController.findAllAdmins);
route.get('/:nip', authentication, UserController.getEmployee);
route.put('/toggle/:nip', authentication, UserController.toggleUser);
route.put('/:nip', authentication, UserController.updateEmployee);
route.post('/admins/register', authentication, UserController.registerAdmin);
route.post('/register', authentication, UserController.registerEmployee);
route.post('/login', UserController.login);

module.exports = route;
