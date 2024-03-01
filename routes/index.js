const route = require('express').Router();
const userRoute = require('./users');
const officeRoute = require('./offices');
const positionRoute = require('./positions');
const echelonRoute = require('./echelons');
const postRoute = require('./posts');
const eventRoute = require('./events');
const provinceRoute = require('./indonesia_provinces');
const cityRoute = require('./indonesia_cities');
const districtRoute = require('./indonesia_districts');
const villageRoute = require('./indonesia_villages');

route.use('/v1/users', userRoute);
route.use('/v1/offices', officeRoute);
route.use('/v1/positions', positionRoute);
route.use('/v1/echelons', echelonRoute);
route.use('/v1/posts', postRoute);
route.use('/v1/events', eventRoute);
route.use('/v1/provinces', provinceRoute);
route.use('/v1/cities', cityRoute);
route.use('/v1/districts', districtRoute);
route.use('/v1/villages', villageRoute);

module.exports = route;