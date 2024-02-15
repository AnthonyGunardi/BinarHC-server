const { sendResponse, sendData } = require('../helpers/response.js');

const errorHandler = (err, req, res, next) => {
  if (err.status) {
      sendResponse(err.status, err.message, res)
  } else if (err.name == `SequelizeValidationError` || err.name == `SequelizeUniqueConstraintError`) {
      let errors = [];
      for (let i = 0; i < err.errors.length; i++) {
          const element = err.errors[i];
          if (element.message == `username must be unique`) {
            errors.push(`Username is Already Registered`);
          }
          else if (element.message == `Password is Required`) {
            errors.push(`Password is Required`);
          }
          else if (element.message == `Email address is not valid`) {
            errors.push(`Email address is not valid`);
          }
          else {
              errors.push(element.message);
          }
      }
      let error = errors.join(', ');
      sendResponse(400, error, res);
  } else {
      sendResponse(500, 'Internal server error', res);
  }
}

module.exports = errorHandler