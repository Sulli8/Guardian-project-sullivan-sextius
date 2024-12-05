const mongoose = require('mongoose');
const { User, Medicament, Prescription, Questionnaire, Question, Response, QuestionnaireQuestion, QuestionResponse, Notification } = require('../models-mongodb/models');

// Connexion à MongoDB
const uri = "mongodb+srv://sullivansextius:T1vcZx08zLzE0pVr@cluster0.hlc6i.mongodb.net/guardian-project?retryWrites=true&w=majority";

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => console.error('Erreur de connexion à MongoDB:', err));

async function deleteData() {
  try {
    console.log('Suppression des données...');

    // Suppression des données dans chaque collection
    await User.deleteMany({});
    await Medicament.deleteMany({});
    await Prescription.deleteMany({});
    await Question.deleteMany({});
    await Response.deleteMany({});
    await Notification.deleteMany({});

    console.log('Toutes les données ont été supprimées avec succès');
  } catch (error) {
    console.error('Erreur lors de la suppression des données:', error);
  } finally {
    mongoose.connection.close(); // Fermer la connexion
  }
}

// Appel de la fonction pour supprimer les données
deleteData();
