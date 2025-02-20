const route = require('express').Router();
const { PostController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');
const adminAuthorization = require('../middlewares/adminAuthorization');

route.post('/', authentication, adminAuthorization, PostController.create);
route.get('/', authentication, PostController.getAllPosts);
route.get('/scroll', authentication, PostController.getPostsByScroll); //with query params, example: ?lastID=36&limit=5&key=lorem
route.get('/:slug', authentication, PostController.getPost);
route.put('/toggle/:slug', authentication, adminAuthorization, PostController.togglePost);
route.put('/:slug', authentication, adminAuthorization, PostController.update);

module.exports = route;