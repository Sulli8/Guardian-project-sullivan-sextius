const { Sequelize } = require('sequelize');

// Import des modèles
const { WebPushTokens, Users, Prescription, Medicaments } = require('../models-mysql');

// Création de l'instance Sequelize
const sequelize = new Sequelize('guardian_project', 'app_user', 'app_password', {
  host: 'localhost', // Ou l'URL de votre base de données
  dialect: 'mysql', // Ou 'postgres', 'sqlite', 'mariadb', 'mssql'
  logging: false, // Désactive les logs SQL
  port: 3306
});

async function syncTables() {
    try {
      // Connexion à la base de données
      await sequelize.authenticate();
      console.log('Connexion à la base de données réussie.');
  
      // Suppression des tables existantes dans l'ordre spécifié
      console.log('Suppression des tables...');
      
      await Prescription.drop(); // Supprime la table Prescription
      console.log('Table Prescription supprimée.');
  
      await Medicaments.drop(); // Supprime la table Medicaments
      console.log('Table Medicaments supprimée.');
  
      await WebPushTokens.drop(); // Supprime la table WebPushToken
      console.log('Table WebPushToken supprimée.');
  
      await Users.drop(); // Supprime la table User
      console.log('Table User supprimée.');
  
      console.log('Toutes les tables ont été supprimées avec succès.');
    } catch (error) {
      console.error('Erreur lors de la suppression des tables :', error);
    } finally {
      // Fermeture de la connexion à la base de données
      await sequelize.close();
      console.log('Connexion à la base de données fermée.');
    }
  }
  
  // Exécuter la suppression des tables
  syncTables();
  

// Exécuter la synchronisation
syncTables();
