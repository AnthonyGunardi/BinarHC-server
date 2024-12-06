const route = require('express').Router();
const { MasterDataController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');
const adminAuthorization = require('../middlewares/adminAuthorization');

route.get('/', authentication, MasterDataController.getAllMasterData);
route.get('/cron', MasterDataController.getCronData);
route.put('/:id', authentication, adminAuthorization, MasterDataController.update);

module.exports = route;