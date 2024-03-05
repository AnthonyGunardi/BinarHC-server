const UserController = require('./user');
const OfficeController = require('./office');
const PositionController = require('./position');
const EchelonController = require('./echelon');
const PostController = require('./post');
const EventController = require('./event');
const PointController = require('./point');
const RewardController = require('./reward');
const IndonesiaProvinceController = require('./indonesia_province');
const IndonesiaCityController = require('./indonesia_city');
const IndonesiaDistrictController = require('./indonesia_district');
const IndonesiaVillageController = require('./indonesia_village');

module.exports = { 
  UserController, 
  OfficeController, 
  PositionController,
  EchelonController,
  PostController, 
  EventController, 
  PointController,
  RewardController,
  IndonesiaProvinceController,
  IndonesiaCityController,
  IndonesiaDistrictController,
  IndonesiaVillageController
};