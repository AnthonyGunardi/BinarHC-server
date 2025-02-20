const route = require('express').Router();
const { PositionController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');
const adminAuthorization = require('../middlewares/adminAuthorization');

route.post('/', authentication, adminAuthorization, PositionController.create);
route.get('/', authentication, adminAuthorization, PositionController.getPositions);
route.get('/assigned/:nip', authentication, PositionController.getUserPosition);
route.get('/:slug', authentication, PositionController.getPosition);
route.put('/assign/:nip', authentication, adminAuthorization, PositionController.addUserPosition);
route.delete('/remove', authentication, adminAuthorization, PositionController.removeUserPosition); //with query params, example: ?nip=12345&id=6

route.put('/:slug', authentication, PositionController.update);

module.exports = route;