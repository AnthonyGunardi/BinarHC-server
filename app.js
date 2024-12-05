if (process.env.NODE_ENV != 'production') {
  require('dotenv').config()
};
const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5006;
const routes = require('./routes');
const errorHandler = require('./middlewares/error-handler');
const fileUpload = require ('express-fileupload');

//MIDDLEWARES
app.use(fileUpload())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(cors());

//routes
app.get('/', (req, res) => {
  res.send('Welcome to Binar HC API v05.12.2024.1544'); 
})
app.use(routes);

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

//error handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`App is listening at port: ${port}`)
});