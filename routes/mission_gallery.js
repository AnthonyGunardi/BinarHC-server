const route = require('express').Router();
const { MissionGalleryController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');
const adminAuthorization = require('../middlewares/adminAuthorization');

route.post('/:slug', authentication, adminAuthorization, MissionGalleryController.create);
// route.get('/gallery/:id', authentication, MissionGalleryController.getGallery);
// route.get('/:slug', authentication, MissionGalleryController.getGalleriesBySlug);
// route.put('/:id', authentication, adminAuthorization, MissionGalleryController.update);
// route.delete('/:id', authentication, adminAuthorization, MissionGalleryController.delete);

module.exports = route;