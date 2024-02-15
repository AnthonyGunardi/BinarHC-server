const route = require('express').Router();
const userRoute = require('./users');
const officeRoute = require('./offices');
const positionRoute = require('./positions');

route.use('/v1/users', userRoute);
route.use('/v1/offices', officeRoute);
route.use('/v1/positions', positionRoute);

module.exports = route;