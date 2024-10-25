const route = require('express').Router();
const { AttendanceController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

// route.get('/', authentication, AbsenceController.getAllAbsences); //with query params, example: ?division_slug=cia&start_date=2024-10-21&end_date=2024-10-23
// route.get('/user', authentication, AbsenceController.getUserAbsencesByScroll); //with query params, example: ?lastID=36&limit=5&type=IJIN
route.post('/', authentication, AttendanceController.clockIn);
// route.post('/success', authentication, AbsenceController.createByAdmin);
route.put('/:nip', authentication, AttendanceController.clockOut);

module.exports = route;