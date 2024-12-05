'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Biodata', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      birthday: {
        type: Sequelize.DATEONLY
      },
      hometown: {
        type: Sequelize.STRING
      },
      hire_date: {
        type: Sequelize.DATEONLY
      },
      annual: {
        type: Sequelize.INTEGER
      },
      religion: {
        type: Sequelize.STRING
      },
      gender: {
        type: Sequelize.STRING
      },
      last_education: {
        type: Sequelize.STRING
      },
      marital_status: {
        type: Sequelize.STRING
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Biodata');
  }
};