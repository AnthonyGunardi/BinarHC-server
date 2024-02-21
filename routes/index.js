const route = require('express').Router();
const userRoute = require('./users');
const officeRoute = require('./offices');
const positionRoute = require('./positions');
const postRoute = require('./posts');
const eventRoute = require('./events');

route.use('/v1/users', userRoute);
route.use('/v1/offices', officeRoute);
route.use('/v1/positions', positionRoute);
route.use('/v1/posts', postRoute);
route.use('/v1/events', eventRoute);

module.exports = route;