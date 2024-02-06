const { Activity, Currency } = require('../models');

class ActivityController {
  static async createActivity(req, res, next) {
    const activityData = {
      description: req.body.description,
      type: req.body.type,
      value: req.body.value,
      UserId: req.body.UserId
    };
    try {
      const userCurrency = await Currency.findOne({ where: { UserId: activityData.UserId } });
      if (activityData.type == 'expense' && userCurrency.balance <= activityData.value) {
          res.status(400).json({ message: 'Balance is not enough' });
      } else {
          const newActivity = await Activity.create(activityData);
          let updatedBalance;
          if (activityData.type == 'expense') {
            updatedBalance = parseInt(userCurrency.balance) - parseInt(activityData.value)
          }
          if (activityData.type == 'revenue') {
            updatedBalance = parseInt(userCurrency.balance) + parseInt(activityData.value)
          }
          const updatedCurrency = await Currency.update(
            { balance: updatedBalance }, 
            {
              where: { UserId: activityData.UserId },
              returning: true
            })
          const { id, description, type, value, UserId } = newActivity;
          res.status(201).json({ id, description, type, value, UserId, message: 'Activity is created' });
      }

    }
    catch (err) {
      next(err)
    };
  };

  static async findActivityByUser(req, res, next) {
    const UserId = req.params.UserId;
    try {
      const activities = await Activity.findAll({
        where: { UserId }
      });
      if (!activities || activities.length == 0) {
        res.status(404).json({ message: 'Activity is not found'})
      } else {
          res.status(200).json(activities);
      }
    }
    catch (err) {
      next(err);
    }
  }
};

module.exports = ActivityController;