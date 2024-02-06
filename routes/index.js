const route = require('express').Router();
const userRoute = require('./users');

route.use('/v1/users', userRoute);

module.exports = route;