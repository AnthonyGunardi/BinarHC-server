const route = require('express').Router();
const { UserController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');
const adminAuthorization = require('../middlewares/adminAuthorization');

route.post('/admins/register', authentication, UserController.registerAdmin);
route.get('/admins', authentication, UserController.findAllAdmins);
route.post('/register', authentication, adminAuthorization, UserController.registerEmployee);
route.post('/login', UserController.adminLogin);
route.post('/employee/login', UserController.employeeLogin);
route.put('/employee/reset/:email', authentication, adminAuthorization, UserController.resetEmployeePassword);
route.get('/employees/birthday', authentication, adminAuthorization, UserController.findBirthdayEmployees);
route.get('/employees', authentication, adminAuthorization, UserController.findAllEmployees);
route.get('/:nip', authentication, UserController.getEmployee);
route.put('/toggle/:nip', authentication, adminAuthorization, UserController.toggleUser);
route.put('/:nip', authentication, adminAuthorization, UserController.updateEmployee);

module.exports = route;
