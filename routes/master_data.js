const route = require('express').Router();
const { MasterDataController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.get('/', authentication, MasterDataController.getAllMasterData);
route.put('/:id', authentication, MasterDataController.update);

module.exports = route;