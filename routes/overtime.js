const route = require('express').Router();
const { OvertimeController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.post('/', authentication, OvertimeController.createByEmployee);
route.post('/success', authentication, OvertimeController.createByAdmin);
route.get('/', authentication, OvertimeController.getAllOvertimes); //with query params, example: ?division_slug=cia&start_date=2024-10-21&end_date=2024-10-23
route.get('/user', authentication, OvertimeController.getUserOvertimesByScroll); //with query params, example: ?lastID=36&limit=5&type=WFA
route.put('/:id', authentication, OvertimeController.update);

module.exports = route;