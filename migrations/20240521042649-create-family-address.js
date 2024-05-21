'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Family_Addresses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      family_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Families',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      },
      address_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Addresses',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
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
    await queryInterface.dropTable('Family_Addresses');
  }
};