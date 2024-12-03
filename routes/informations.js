const route = require('express').Router();
const { InformationController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.post('/', authentication, InformationController.create);
route.get('/', authentication, InformationController.getAllInformations);
route.get('/type/:type', authentication, InformationController.getInformationByType);
route.get('/:id', authentication, InformationController.getInformation);
// route.put('/toggle/:id', authentication, RewardController.toggleReward);
// route.put('/:id', authentication, RewardController.update);

module.exports = route;