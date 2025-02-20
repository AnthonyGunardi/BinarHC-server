const route = require('express').Router();
const { PostGalleryController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');
const adminAuthorization = require('../middlewares/adminAuthorization');

route.post('/:slug', authentication, adminAuthorization, PostGalleryController.create);
route.get('/gallery/:id', authentication, PostGalleryController.getGallery);
route.get('/:slug', authentication, PostGalleryController.getGalleries);
route.put('/:id', authentication, adminAuthorization, PostGalleryController.update);
route.delete('/:id', authentication, adminAuthorization, PostGalleryController.delete);

module.exports = route;