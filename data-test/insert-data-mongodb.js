const mongoose = require('mongoose');
const crypto = require('crypto');
const { User, Medicament, Prescription, Questionnaire, Question, Response, QuestionnaireQuestion, QuestionResponse, Notification } = require('../models-mongodb/models');

// Connexion à MongoDB
const uri = "mongodb+srv://sullivansextius:T1vcZx08zLzE0pVr@cluster0.hlc6i.mongodb.net/guardian-project?retryWrites=true&w=majority";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => console.error('Erreur de connexion à MongoDB:', err));

async function insertData() {
  try {
    // Effacer les collections existantes (optionnel)
    await User.deleteMany({});
    await Medicament.deleteMany({});
    await Prescription.deleteMany({});
    await Questionnaire.deleteMany({});
    await Question.deleteMany({});
    await Response.deleteMany({});
    await Notification.deleteMany({});
    await QuestionnaireQuestion.deleteMany({});
    await QuestionResponse.deleteMany({});

    // Étape 1: Insérer des utilisateurs avec un token
    const users = await User.insertMany([
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
      },
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        password: 'password456',
        token: crypto.randomBytes(32).toString('hex')  // Génère un token unique pour l'utilisateur
      }
    ]);
    console.log('Utilisateurs insérés avec succès');

    // Étape 2: Insérer des médicaments
    const medicaments = await Medicament.insertMany([
      { name: 'Paracetamol', dosage: '500 mg', description: 'Médicament contre la douleur' },
      { name: 'Ibuprofen', dosage: '200 mg', description: 'Médicament anti-inflammatoire' },
      { name: 'Aspirin', dosage: '300 mg', description: 'Antidouleur et anti-inflammatoire' }
    ]);
    console.log('Médicaments insérés avec succès');

    // Étape 3: Insérer des prescriptions
    const prescriptions = await Prescription.insertMany([
      {
        quantity: 30,
        rythme: 30,
        dosage: '500 mg',
        userId: users[0]._id,    // Associe à l'utilisateur Sullivan
        medicamentId: medicaments[0]._id  // Associe au Paracetamol
      },
      {
        quantity: 20,
        rythme:30,
        dosage: '200 mg',
        userId: users[1]._id,    // Associe à l'utilisateur Jane
        medicamentId: medicaments[1]._id  // Associe à l'Ibuprofen
      },
      {
        quantity: 25,
        rythme:30,
        dosage: '300 mg',
        userId: users[2]._id,    // Associe à l'utilisateur John
        medicamentId: medicaments[2]._id  // Associe à l'Aspirin
      }
    ]);
    console.log('Prescriptions insérées avec succès');

    // Étape 4: Insérer des questionnaires
    const questionnaires = await Questionnaire.insertMany([
      { title: 'Health Questionnaire', description: 'A general health questionnaire.' },
      { title: 'Medication Feedback', description: 'A questionnaire for feedback on medication.' }
    ]);
    console.log('Questionnaires insérés avec succès');

    // Étape 5: Insérer des questions
    const questions = await Question.insertMany([
      { questionText: 'Do you have any allergies?', questionType: 'boolean' },
      { questionText: 'How often do you take your medication?', questionType: 'text' },
      { questionText: 'Which medication are you currently taking?', questionType: 'multiple_choice', responses: [] }
    ]);
    console.log('Questions insérées avec succès');

    // Étape 6: Insérer des réponses pour les questions à choix multiple
    const responses = await Response.insertMany([
      { responseText: 'Paracetamol', isCorrect: false, questionId: questions[2]._id },
      { responseText: 'Ibuprofen', isCorrect: false, questionId: questions[2]._id },
      { responseText: 'Aspirin', isCorrect: false, questionId: questions[2]._id }
    ]);
    console.log('Réponses insérées avec succès');

    // Étape 7: Associer des questions aux questionnaires
    await QuestionnaireQuestion.insertMany([
      { questionnaireId: questionnaires[0]._id, questionId: questions[0]._id },
      { questionnaireId: questionnaires[0]._id, questionId: questions[1]._id },
      { questionnaireId: questionnaires[1]._id, questionId: questions[2]._id }
    ]);
    console.log('Questions associées aux questionnaires avec succès');

    // Étape 8: Associer des réponses aux questions
    await QuestionResponse.insertMany([
      { questionId: questions[2]._id, responseId: responses[0]._id },
      { questionId: questions[2]._id, responseId: responses[1]._id },
      { questionId: questions[2]._id, responseId: responses[2]._id }
    ]);
    console.log('Réponses associées aux questions avec succès');

      // Étape 4: Insérer des notifications
      const notifications = await Notification.insertMany([
        {
          userId: users[0]._id,
          title: 'Nouvelle prescription',
          body: 'Vous avez une nouvelle prescription pour le Paracetamol.',
          status: 'unread',
          url: 'https://votre-site.com/prescription/1',
        },
        {
          userId: users[1]._id,
          title: 'Nouvelle prescription',
          body: 'Vous avez une nouvelle prescription pour l\'Ibuprofen.',
          status: 'unread',
          url: 'https://votre-site.com/prescription/2',
        },
        {
          userId: users[2]._id,
          title: 'Nouvelle prescription',
          body: 'Vous avez une nouvelle prescription pour l\'Aspirin.',
          status: 'unread',
          url: 'https://votre-site.com/prescription/3',
        }
      ]);
      console.log('Notifications insérées avec succès');


  } catch (error) {
    console.error('Erreur lors de l\'insertion des données:', error);
  } finally {
    mongoose.connection.close(); // Fermer la connexion
  }


  

}

insertData();
