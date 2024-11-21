const { Users, Medicaments, Prescription, Questions, Responses, Questionnaires, Questionnaires_Questions } = require('../models');
const crypto = require('crypto');
const { Sequelize, DataTypes } = require('sequelize');

// Création de l'instance Sequelize
const sequelize = new Sequelize('guardian_project', 'app_user', 'app_password', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false,
  port: 3306
});

async function insertData() {
  try {
    // Synchronisation avec la base de données
    await sequelize.sync();

    // Étape 1: Insérer des utilisateurs avec un token
    const users = await Users.bulkCreate([
      {
        firstName: 'Sullivan',
        lastName: 'Sextius',
        email: 'Sullivan.Sextius@gmail.com',
        password: 'password123',
        token: "google-oauth2|102033749551205673424"
      },
      {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        password: 'password123',
        token: crypto.randomBytes(32).toString('hex')  // Génère un token unique pour l'utilisateur
      }
    ]);

    console.log('Utilisateurs insérés avec succès');

    // Étape 2: Insérer des médicaments
    const medicaments = await Medicaments.bulkCreate([
      { name: 'Paracetamol', dosage: '500 mg', description: 'Médicament contre la douleur' },
      { name: 'Ibuprofen', dosage: '200 mg', description: 'Médicament anti-inflammatoire' }
    ]);

    console.log('Médicaments insérés avec succès');

    // Étape 3: Insérer des prescriptions
    const prescriptions = await Prescription.bulkCreate([
      {
        quantity: 30,
        dosage: '500 mg',
        userId: users[0].id,    // Associe à l'utilisateur Sullivan
        medicamentId: medicaments[0].id  // Associe au Paracetamol
      },
      {
        quantity: 20,
        dosage: '200 mg',
        userId: users[1].id,    // Associe à l'utilisateur Jane
        medicamentId: medicaments[1].id  // Associe à l'Ibuprofen
      }
    ]);

    console.log('Prescriptions insérées avec succès');

 
  } catch (error) {
    console.error('Erreur lors de l\'insertion des données:', error);
  }
}

insertData();
