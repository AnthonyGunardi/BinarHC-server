const route = require('express').Router();
const { PointController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

// route.get('/', authentication, PostController.getAllPosts);
route.put('/:id', authentication, PointController.modify);
// route.get('/:slug', authentication, PostController.getPost);
// route.put('/toggle/:slug', authentication, PostController.togglePost);
// route.put('/:slug', authentication, PostController.update);

module.exports = route;