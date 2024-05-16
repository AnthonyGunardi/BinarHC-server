const route = require('express').Router();
const { RewardLogController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.get('/', authentication, RewardLogController.getRewardLogs); //optional: query params, example: ?status=pending
route.get('/user/:nip', authentication, RewardLogController.getRewardLogsByNip);
route.get('/:id', authentication, RewardLogController.getRewardLog);
route.put('/:id', authentication, RewardLogController.update);


module.exports = route;