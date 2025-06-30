const route = require('express').Router();
const { EchelonController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');
const adminAuthorization = require('../middlewares/adminAuthorization');

route.post('/', authentication, adminAuthorization, EchelonController.create);
route.get('/', authentication, EchelonController.getAllEchelons);
route.get("/:code", authentication, EchelonController.getEchelon);
route.put("/:code", authentication, adminAuthorization, EchelonController.update);

module.exports = route;