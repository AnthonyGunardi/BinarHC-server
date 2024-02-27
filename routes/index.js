const route = require('express').Router();
const userRoute = require('./users');
const officeRoute = require('./offices');
const positionRoute = require('./positions');
const echelonRoute = require('./echelons');
const postRoute = require('./posts');
const eventRoute = require('./events');
const provinceRoute = require('./indonesia_provinces');

route.use('/v1/users', userRoute);
route.use('/v1/offices', officeRoute);
route.use('/v1/positions', positionRoute);
route.use('/v1/echelons', echelonRoute);
route.use('/v1/posts', postRoute);
route.use('/v1/events', eventRoute);
route.use('/v1/provinces', provinceRoute);

module.exports = route;