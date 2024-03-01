const route = require('express').Router();
const { IndonesiaCityController }  = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.get('/', authentication, IndonesiaCityController.getCitiesByProvince); // with query ?province_id={province_id}
route.get('/:id', authentication, IndonesiaCityController.getCity);

module.exports = route;