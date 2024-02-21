const route = require('express').Router();
const { PostController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');
const multer = require('multer');
const diskStorage = require('../middlewares/diskStorage');

route.get('/', authentication, PostController.getAllPosts);
route.post('/', authentication, multer({ storage: diskStorage }).single("thumbnail"), PostController.create);
// route.get('/:slug', authentication, PostController.getOffice);
// route.put('/:slug', authentication, PostController.update);
// route.put('/toggle/:slug', authentication, PostController.toggleOffice);

module.exports = route;