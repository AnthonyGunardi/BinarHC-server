const route = require('express').Router();
const { AttendanceController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');
const adminAuthorization = require('../middlewares/adminAuthorization');

route.post('/', authentication, AttendanceController.clockIn);
route.post('/scan', authentication, AttendanceController.scanAttendance);
route.post('/user', authentication, adminAuthorization,AttendanceController.clockInByAdmin);
route.get('/', authentication, adminAuthorization, AttendanceController.getAllAttendances); //with query params, example: ?start_date=2024-10-21&end_date=2024-10-23&division_slug=cia&status=WFO&NIP=BINAR00004
route.get('/report', authentication, adminAuthorization,AttendanceController.getAttendancesReport); //with query params, example: ?start_date=2024-10-21&end_date=2024-10-23&division_slug=cia&status=WFO&NIP=BINAR00004
route.get('/user', authentication, AttendanceController.getUserAttendancesByScroll); //with query params, example: ?lastID=36&limit=5&nip=BINAR00004
route.put('/update/:id', authentication, adminAuthorization,AttendanceController.update);
route.put('/:nip', authentication, AttendanceController.clockOut);

module.exports = route;