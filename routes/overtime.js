const route = require('express').Router();
const { OvertimeController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

// route.get('/', authentication, PostController.getAllPosts);
// route.get('/scroll', authentication, PostController.getPostsByScroll); //with query params, example: ?lastID=36&limit=5&key=lorem
// route.get('/:slug', authentication, PostController.getPost);
route.post('/', authentication, OvertimeController.createByEmployee);
// route.put('/toggle/:slug', authentication, PostController.togglePost);
// route.put('/:slug', authentication, PostController.update);

module.exports = route;