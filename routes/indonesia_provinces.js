const route = require('express').Router();
const { IndonesiaProvinceController} = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

route.get('/', authentication, IndonesiaProvinceController.getAllProvinces);
route.get('/:id', authentication, IndonesiaProvinceController.getProvince);

module.exports = route;