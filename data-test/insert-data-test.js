const { User, Medicament, WebPushToken, Prescription } = require('../models'); // Assurez-vous que vos modèles sont correctement importés
const fs = require('fs');

// Charger les données depuis le fichier data-test.json
const data = JSON.parse(fs.readFileSync('data-test.json', 'utf-8'));

// Extraire les objets du fichier JSON dans des variables
const users = data.users;
const medicaments = data.medicaments;
const webPushTokens = data.webPushTokens;
const prescriptions = data.prescriptions;

// Fonction pour insérer les utilisateurs
async function insertUsers() {
  try {
    for (let user of users) {
      await User.create(user);
    }
    console.log("Users inserted successfully!");
  } catch (error) {
    console.error("Error inserting users:", error);
  }
}

// Fonction pour insérer les médicaments
async function insertMedicaments() {
  try {
    for (let medicament of medicaments) {
      await Medicament.create(medicament);
    }
    console.log("Medicaments inserted successfully!");
  } catch (error) {
    console.error("Error inserting medicaments:", error);
  }
}

// Fonction pour insérer les tokens WebPush
async function insertWebPushTokens() {
  try {
    for (let token of webPushTokens) {
      await WebPushToken.create(token);
    }
    console.log("WebPush tokens inserted successfully!");
  } catch (error) {
    console.error("Error inserting WebPush tokens:", error);
  }
}

// Fonction pour insérer les prescriptions
async function insertPrescriptions() {
  try {
    for (let prescription of prescriptions) {
      await Prescription.create(prescription);
    }
    console.log("Prescriptions inserted successfully!");
  } catch (error) {
    console.error("Error inserting prescriptions:", error);
  }
}

// Fonction principale qui exécute toutes les insertions
async function insertAllData() {
  try {
    await insertUsers();
    await insertMedicaments();
    await insertWebPushTokens();
    await insertPrescriptions();
    console.log("All data inserted successfully!");
  } catch (error) {
    console.error("Error inserting all data:", error);
  }
}

// Exécuter l'insertion des données
insertAllData();
