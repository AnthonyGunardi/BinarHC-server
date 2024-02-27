const route = require('express').Router();
const { EchelonController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.get('/', authentication, EchelonController.getAllEchelons);
route.post('/', authentication, EchelonController.create);
route.get("/:code", authentication, EchelonController.getEchelon);
route.put("/:code", authentication, EchelonController.update);

module.exports = route;