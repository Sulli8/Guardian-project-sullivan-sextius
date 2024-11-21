'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Créer la table 'Users'
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstName: {
        type: Sequelize.STRING
      },
      lastName: {
        type: Sequelize.STRING
      },
      token:{
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
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

    // Créer la table 'WebPushTokens'
    await queryInterface.createTable('WebPushTokens', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      token: {
        type: Sequelize.STRING
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
          onDelete: 'CASCADE', // Supprime les WebPushTokens si l'utilisateur est supprimé
          onUpdate: 'CASCADE'  // Met à jour la clé étrangère si l'ID de l'utilisateur change
        },
        allowNull: false
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

    // Créer la table 'Medicaments'
    await queryInterface.createTable('Medicaments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      dosage: {
        type: Sequelize.STRING
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

    // Créer la table 'Prescriptions' avec les liens entre Prescription, User et Medicament
    await queryInterface.createTable('Prescriptions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        allowNull: false
      },
      medicamentId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Medicaments',
          key: 'id',
          onDelete: 'SET NULL', // Si un médicament est supprimé, le champ devient NULL
          onUpdate: 'CASCADE'
        },
        allowNull: false
      },
      quantity: {
        type: Sequelize.INTEGER
      },
      dosage: {
        type: Sequelize.STRING
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
    // Supprimer les tables dans l'ordre inverse
    await queryInterface.dropTable('Prescriptions');
    await queryInterface.dropTable('Medicaments');
    await queryInterface.dropTable('WebPushTokens');
    await queryInterface.dropTable('Users');
  }
};
