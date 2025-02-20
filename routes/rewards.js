const route = require('express').Router();
const { RewardController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');
const adminAuthorization = require('../middlewares/adminAuthorization');

route.post('/', authentication, adminAuthorization, RewardController.create);
route.get('/', authentication, RewardController.getAllRewards);
route.get('/scroll', authentication, RewardController.getRewardsByScroll); //with query params, example: ?lastID=36&limit=5&key=lorem
route.get('/:id', authentication, RewardController.getReward);
route.put('/toggle/:id', authentication, adminAuthorization, RewardController.toggleReward);
route.put('/:id', authentication, adminAuthorization, RewardController.update);

module.exports = route;