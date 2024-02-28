const route = require('express').Router();
const { PositionController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.get('/', authentication, PositionController.getPositions);
route.post('/', authentication, PositionController.create);
route.get('/:slug', authentication, PositionController.getPosition);
route.put('/:slug', authentication, PositionController.update);

module.exports = route;