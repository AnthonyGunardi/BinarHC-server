const route = require('express').Router();
const { PositionController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.post('/', authentication, PositionController.create);
route.get('/', authentication, PositionController.getPositions);
route.get('/assigned/:nip', authentication, PositionController.getUserPosition);
route.get('/:slug', authentication, PositionController.getPosition);
route.put('/assign/:nip', authentication, PositionController.addUserPosition);
route.delete('/remove', authentication, PositionController.removeUserPosition); //with query params, example: ?nip=12345&id=6

route.put('/:slug', authentication, PositionController.update);

module.exports = route;