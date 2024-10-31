const route = require('express').Router();
const { AttendanceController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.post('/', authentication, AttendanceController.clockIn);
route.get('/', authentication, AttendanceController.getAllAttendances); //with query params, example: ?start_date=2024-10-21&end_date=2024-10-23&division_slug=cia&status=WFO&NIP=BINAR00004
route.get('/user', authentication, AttendanceController.getUserAttendancesByScroll); //with query params, example: ?lastID=36&limit=5&nip=BINAR00004
// route.post('/success', authentication, AbsenceController.createByAdmin);
route.put('/update/:id', authentication, AttendanceController.update);
route.put('/:nip', authentication, AttendanceController.clockOut);

module.exports = route;