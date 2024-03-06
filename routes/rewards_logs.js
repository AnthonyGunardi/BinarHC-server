const route = require('express').Router();
const { RewardLogController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.get('/', authentication, RewardLogController.getRewardLogs);
route.get('/:id', authentication, RewardLogController.getRewardLog);
route.put('/:id', authentication, RewardLogController.update);


module.exports = route;