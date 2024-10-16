const route = require('express').Router();
const { AbsenceController } = require('../controllers');
const authentication = require('../middlewares/userAuthentication');

// route.get('/', authentication, PostController.getAllPosts);
route.get('/', authentication, AbsenceController.getAllAbsences);
route.get('/user', authentication, AbsenceController.getUserAbsencesByScroll); //with query params, example: ?lastID=36&limit=5&type=IJIN
// route.get('/:slug', authentication, PostController.getPost);
route.post('/', authentication, AbsenceController.createByEmployee);
// route.put('/toggle/:slug', authentication, PostController.togglePost);
route.put('/:id', authentication, AbsenceController.update);

module.exports = route;