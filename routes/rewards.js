const route = require('express').Router();
const { RewardController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.get('/', authentication, RewardController.getAllRewards);
route.get('/scroll', authentication, RewardController.getRewardsByScroll); //with query params, example: ?lastID=36&limit=5&key=lorem
route.get('/:id', authentication, RewardController.getReward);
route.post('/', authentication, RewardController.create);
route.put('/toggle/:id', authentication, RewardController.toggleReward);
route.put('/:id', authentication, RewardController.update);

module.exports = route;