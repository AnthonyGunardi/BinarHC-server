const route = require('express').Router();
const { IndonesiaDistrictController }  = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.get('/', authentication, IndonesiaDistrictController.getDistrictsByCity); // with query ?city_id={city_id}
route.get('/:id', authentication, IndonesiaDistrictController.getDistrict);

module.exports = route;