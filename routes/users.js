const route = require('express').Router();
const { UserController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');
const adminAuthorization = require('../middlewares/adminAuthorization');

route.post('/admins/register', authentication, UserController.registerAdmin);
route.post('/register', authentication, adminAuthorization, UserController.registerEmployee);
route.post('/login', UserController.adminLogin);
route.post('/employee/login', UserController.employeeLogin);
route.get('/admins', authentication, adminAuthorization,UserController.findAllAdmins);
route.get('/employees/check/:nip', UserController.checkUserNip);
route.get('/employees/birthday', authentication, UserController.findBirthdayEmployees);
route.get('/employees/contract_end', authentication, adminAuthorization,UserController.findContractEndEmployees);
route.get('/employees', authentication, adminAuthorization, UserController.findAllEmployees);
route.get('/:nip', authentication, UserController.getEmployee);
route.put('/employee/reset/:email', authentication, adminAuthorization, UserController.resetPassword);
route.put('/employee/password/:nip', authentication, UserController.updatePassword);
route.put('/toggle/:nip', authentication, adminAuthorization, UserController.toggleUser);
route.put('/admins/:id', authentication, adminAuthorization, UserController.updateAdmin);
route.put('/:nip', authentication, adminAuthorization, UserController.updateEmployee);

module.exports = route;
