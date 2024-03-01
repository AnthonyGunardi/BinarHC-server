const route = require('express').Router();
const { IndonesiaVillageController }  = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.get('/', authentication, IndonesiaVillageController.getVillagesByDistrict); // with query ?district_id={district_id}
route.get('/:id', authentication, IndonesiaVillageController.getVillage);

module.exports = route;