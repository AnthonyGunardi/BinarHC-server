const route = require('express').Router();
const userRoute = require('./users');
const officeRoute = require('./offices');

route.use('/v1/users', userRoute);
route.use('/v1/offices', officeRoute);

module.exports = route;