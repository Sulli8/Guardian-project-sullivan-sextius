const mongoose = require('mongoose');
const crypto = require('crypto');
const { User, Medicament, Prescription, Questionnaire, Question, Response, QuestionnaireQuestion, QuestionResponse, Notification } = require('../models-mongodb/models');
const { Db } = require('mongodb');

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
    await Question.deleteMany({});
    await Response.deleteMany({});
    await Notification.deleteMany({});

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
      { name: 'Paracetamol', dosage: '500 mg', description: 'Médicament contre la douleur', type: 'comprime' },
      { name: 'Ibuprofen', dosage: '200 mg', description: 'Médicament anti-inflammatoire', type: 'gellule' },
      { name: 'Aspirin', dosage: '300 mg', description: 'Antidouleur et anti-inflammatoire', type: 'topique' },
      { name: 'Amoxicilline', dosage: '250 mg', description: 'Antibiotique pour infections', type: 'comprime' },
      { name: 'Paracétamol 1000mg', dosage: '1000 mg', description: 'Analgésique puissant', type: 'comprime' },
      { name: 'Ibuprofen Extra', dosage: '400 mg', description: 'Anti-inflammatoire et antalgique', type: 'gellule' },
      { name: 'Naproxène', dosage: '250 mg', description: 'Antidouleur et anti-inflammatoire', type: 'gellule' },
      { name: 'Prednisone', dosage: '5 mg', description: 'Corticostéroïde anti-inflammatoire', type: 'comprime' },
      { name: 'Diazépam', dosage: '10 mg', description: 'Anxiolytique et sédatif', type: 'comprime' },
      { name: 'Loratadine', dosage: '10 mg', description: 'Antihistaminique contre les allergies', type: 'comprime' },
      { name: 'Cétirizine', dosage: '10 mg', description: 'Antihistaminique contre les allergies', type: 'comprime' },
      { name: 'Omeprazole', dosage: '20 mg', description: 'Antiacide pour les brûlures d’estomac', type: 'gellule' },
      { name: 'Metformine', dosage: '500 mg', description: 'Médicament pour le diabète', type: 'comprime' },
      { name: 'Fluconazole', dosage: '150 mg', description: 'Antifongique pour infections', type: 'comprime' },
      { name: 'Ciprofloxacine', dosage: '500 mg', description: 'Antibiotique pour infections bactériennes', type: 'gellule' },
      { name: 'Lisinopril', dosage: '10 mg', description: 'Antihypertenseur', type: 'comprime' },
      { name: 'Paroxétine', dosage: '20 mg', description: 'Antidépresseur', type: 'comprime' },
      { name: 'Vitamines C', dosage: '500 mg', description: 'Supplément vitaminique', type: 'gellule' },
      { name: 'Ibuprofène Suspension', dosage: '200 mg', description: 'Suspension buvable anti-inflammatoire', type: 'gellule' },
      { name: 'Acide Ascorbique', dosage: '1000 mg', description: 'Vitamine C en comprimé', type: 'comprime' }
    ]);
    

    console.log('Médicaments insérés avec succès');
    
   
    // Étape 3: Insérer des prescriptions
    const prescriptions = await Prescription.insertMany([
      {
        frequence: '1 fois par jour', // Exemple de fréquence
        dosage: '500 mg',
        userId: users[0]._id,  // Associe à l'utilisateur Sullivan
        medicamentId: medicaments[0]._id,  // Associe au Paracetamol
        datePrescribed: new Date(), // Date actuelle
        timePrescribed: new Date()
      },
      {
        frequence: '2 fois par jour', // Exemple de fréquence
        dosage: '200 mg',
        userId: users[1]._id,  // Associe à l'utilisateur Jane
        medicamentId: medicaments[1]._id,  // Associe à l'Ibuprofen
        datePrescribed: new Date(), // Date actuelle
        timePrescribed: new Date()
      },
      {
        frequence: 'toutes les 6 heures',  // Exemple de fréquence
        dosage: '300 mg',
        userId: users[2]._id,  // Associe à l'utilisateur John
        medicamentId: medicaments[2]._id,  // Associe à l'Aspirin
        datePrescribed: new Date(), // Date actuelle
        timePrescribed: new Date()
      }
    ]);
    
    
    console.log('Prescriptions insérées avec succès');


  
    const insertedQuestions = await Question.insertMany( [
      { step: 1, text: 'Quel est votre âge ?', type: 'number' },
      { step: 1, text: 'Êtes-vous fumeur ? (oui/non)', type: 'boolean' },
      { step: 1, text: 'Consommez-vous de l\'alcool régulièrement ?', type: 'boolean' },
      { step: 1, text: 'Faites-vous de l\'exercice physique régulièrement ?', type: 'boolean' },
      { step: 1, text: 'Avez-vous des allergies connues ? (oui/non)', type: 'boolean' },
      { step: 2, text: 'Avez-vous des antécédents médicaux familiaux ? (oui/non)', type: 'boolean' },
      { step: 2, text: 'Êtes-vous actuellement sous traitement médical ? (oui/non)', type: 'boolean' },
      { step: 2, text: 'Avez-vous des problèmes cardiaques ?', type: 'boolean' },
      { step: 2, text: 'Avez-vous déjà eu des problèmes respiratoires ?', type: 'boolean' },
      { step: 3, text: 'Sur une échelle de 1 à 10, comment évaluez-vous votre niveau de stress actuel ?', type: 'rating' },
      { step: 3, text: 'Avez-vous des douleurs chroniques ?', type: 'boolean' },
      { step: 3, text: 'Avez-vous récemment consulté un médecin pour un problème de santé ?', type: 'boolean' },
      { step: 3, text: 'Avez-vous des préoccupations particulières concernant votre santé ?', type: 'text' }
    ]);
    console.log('Questions insérées avec succès');
    
    const responses = await Response.insertMany([
      { responseText: '30', questionId: insertedQuestions[0]._id, userId: users[1]._id },
      { responseText: 'true', questionId: insertedQuestions[1]._id, userId: users[1]._id },
      { responseText: 'false', questionId: insertedQuestions[2]._id, userId: users[1]._id },
      { responseText: 'true', questionId: insertedQuestions[3]._id, userId: users[1]._id },
      { responseText: 'false', questionId: insertedQuestions[4]._id, userId: users[1]._id },
      { responseText: 'true', questionId: insertedQuestions[5]._id, userId: users[1]._id },
      { responseText: 'false', questionId: insertedQuestions[6]._id, userId: users[1]._id },
      { responseText: 'true', questionId: insertedQuestions[7]._id, userId: users[1]._id },
      { responseText: 'false', questionId: insertedQuestions[8]._id, userId: users[1]._id },
      { responseText: '8', questionId: insertedQuestions[9]._id, userId: users[1]._id },
      { responseText: 'true', questionId: insertedQuestions[10]._id, userId: users[1]._id },
      { responseText: 'false', questionId: insertedQuestions[11]._id, userId: users[1]._id },
      { responseText: 'Non, je suis en bonne santé.', questionId: insertedQuestions[12]._id, userId: users[1]._id }
    ]);   
    console.log('Réponses insérées avec succès');


     // Étape 4: Insérer des notifications
     const notifications = await Notification.insertMany([
      {
        userId: users[0]._id,
        title: 'Nouvelle prescription',
        body: 'Vous avez une nouvelle prescription pour le Paracetamol.',
        status: 'unread',
        url: 'https://votre-site.com/prescription/1',
        prescriptionId: prescriptions[0]._id, // Ajout du prescriptionId ici
        nbNotification: 1, // Initialisation du compteur de notifications
        dateNotification: new Date(), // Date de la notification envoyée
        isSubscribe: false, // Ajout du champ isSubscribe, initialisé à false
      },
      {
        userId: users[1]._id,
        title: 'Nouvelle prescription',
        body: 'Vous avez une nouvelle prescription pour l\'Ibuprofen.',
        status: 'unread',
        url: 'https://votre-site.com/prescription/2',
        prescriptionId: prescriptions[1]._id, // Ajout du prescriptionId ici
        nbNotification: 1, // Initialisation du compteur de notifications
        dateNotification: new Date(), // Date de la notification envoyée
        isSubscribe: false, // Ajout du champ isSubscribe, initialisé à false
      },
      {
        userId: users[2]._id,
        title: 'Nouvelle prescription',
        body: 'Vous avez une nouvelle prescription pour l\'Aspirin.',
        status: 'unread',
        url: 'https://votre-site.com/prescription/3',
        prescriptionId: prescriptions[2]._id, // Ajout du prescriptionId ici
        nbNotification: 1, // Initialisation du compteur de notifications
        dateNotification: new Date(), // Date de la notification envoyée
        isSubscribe: false, // Ajout du champ isSubscribe, initialisé à false
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
