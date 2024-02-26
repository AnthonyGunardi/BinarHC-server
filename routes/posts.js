const route = require('express').Router();
const { PostController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');
const multer = require('multer');
const diskStorage = require('../config/diskStorage');

route.get('/', authentication, PostController.getAllPosts);
// route.post('/', authentication, multer({ storage: diskStorage }).single("thumbnail"), PostController.create);
route.post('/', authentication, PostController.create2);
route.get('/:slug', authentication, PostController.getPost);
// route.put('/:slug', authentication, multer({ storage: diskStorage }).single("thumbnail"), PostController.update);
route.put('/:slug', authentication, PostController.update2);
route.put('/toggle/:slug', authentication, PostController.togglePost);

module.exports = route;