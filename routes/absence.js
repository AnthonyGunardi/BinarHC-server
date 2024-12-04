const route = require('express').Router();
const { AbsenceController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');
const adminAuthorization = require('../middlewares/adminAuthorization');

route.post('/', authentication, AbsenceController.createByEmployee);
route.post('/success', authentication, adminAuthorization,AbsenceController.createByAdmin);
route.get('/', authentication, adminAuthorization,AbsenceController.getAllAbsences); //with query params, example: ?division_slug=cia&start_date=2024-10-21&end_date=2024-10-23&status=success
route.get('/user', authentication, AbsenceController.getUserAbsencesByScroll); //with query params, example: ?lastID=36&limit=5&type=IJIN
route.put('/:id', authentication, adminAuthorization, AbsenceController.update);

module.exports = route;