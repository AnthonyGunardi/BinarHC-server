const route = require('express').Router();
const { RewardController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.get('/', authentication, RewardController.getAllRewards);
route.post('/', authentication, RewardController.create);
route.get('/:id', authentication, RewardController.getReward);
route.put('/toggle/:id', authentication, RewardController.toggleReward);
// route.put('/:slug', authentication, PostController.update);


module.exports = route;