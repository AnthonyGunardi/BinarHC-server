const route = require('express').Router();
const { PostGalleryController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.get('/gallery/:id', authentication, PostGalleryController.getGallery);
route.get('/:slug', authentication, PostGalleryController.getGalleries);
route.post('/:slug', authentication, PostGalleryController.create);
route.put('/:id', authentication, PostGalleryController.update);
route.delete('/:id', authentication, PostGalleryController.delete);

module.exports = route;