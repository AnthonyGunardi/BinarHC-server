const route = require('express').Router();
const { PostController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.get('/', authentication, PostController.getAllPosts);
route.post('/', authentication, PostController.create);
// route.get('/:slug', authentication, PostController.getOffice);
// route.put('/:slug', authentication, PostController.update);
// route.put('/toggle/:slug', authentication, PostController.toggleOffice);

module.exports = route;