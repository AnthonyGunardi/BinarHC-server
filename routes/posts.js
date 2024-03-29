const route = require('express').Router();
const { PostController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.get('/', authentication, PostController.getAllPosts);
route.get('/scroll', authentication, PostController.getPostsByScroll); //with query params, example: ?lastID=36&limit=5&key=lorem
route.get('/:slug', authentication, PostController.getPost);
route.post('/', authentication, PostController.create);
route.put('/toggle/:slug', authentication, PostController.togglePost);
route.put('/:slug', authentication, PostController.update);

module.exports = route;