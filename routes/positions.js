const route = require('express').Router();
const { PositionController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.get('/', PositionController.getPositions);
route.post('/', PositionController.addPosition);
// route.get("/:uuid", PositionController.getPosition);

module.exports = route;