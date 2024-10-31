const route = require('express').Router();
const { EchelonController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.post('/', authentication, EchelonController.create);
route.get('/', authentication, EchelonController.getAllEchelons);
route.get("/:code", authentication, EchelonController.getEchelon);
route.put("/:code", authentication, EchelonController.update);

module.exports = route;