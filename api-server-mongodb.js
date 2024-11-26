const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const webPush = require('web-push');  // Importer la bibliothèque WebPush
const { auth } = require('express-oauth2-jwt-bearer');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const authConfig = require('./auth_config.json');
 
const app = express();
const uri = "mongodb+srv://sullivansextius:T1vcZx08zLzE0pVr@cluster0.hlc6i.mongodb.net/guardian-project?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


let db;

// Ensure auth_config.json is properly configured
if (
  !authConfig.domain ||
  !authConfig.authorizationParams.audience ||
  ["YOUR_API_IDENTIFIER", "{yourApiIdentifier}"].includes(authConfig.authorizationParams.audience)
) {
  console.log("Exiting: Please make sure that auth_config.json is in place and populated with valid domain and audience values");
  process.exit();
}

// Middleware setup
app.use(morgan('dev'));
app.use(helmet());
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const checkJwt = auth({
  audience: authConfig.authorizationParams.audience,
  issuerBaseURL: `https://${authConfig.domain}`,
});

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await client.connect();
    db = client.db('guardian-project'); // Replace 'myDatabase' with your actual DB name
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
}
connectToDatabase();

// Users API
app.post('/api/create_user', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required: firstName, lastName, email, password.' });
    }

    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'A user with this email already exists.' });
    }

    const newUser = await db.collection('users').insertOne({ firstName, lastName, email, password });
    res.status(201).json({ message: "User created successfully", userId: newUser.insertedId });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user" });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, password } = req.body;

    const updatedFields = {};
    if (firstName) updatedFields.firstName = firstName;
    if (lastName) updatedFields.lastName = lastName;
    if (email) updatedFields.email = email;
    if (password) updatedFields.password = password;

    const result = await db.collection('users').updateOne({ _id: new ObjectId(id) }, { $set: updatedFields });
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

app.post('/api/prescriptions', checkJwt, async (req, res) => {
    try {
      // Extraire les données de la requête
      const { medicationId, quantity, dosage, rythme } = req.body;
      // Récupérer le token du payload JWT
      const tokenFromJwt = req.auth.payload.sub;
  
      // Vérifier si un utilisateur avec ce token existe dans la base de données
      const user = await db.collection('users').findOne({ token: tokenFromJwt });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Vérification de la présence des informations nécessaires
      if (!medicationId || !quantity || !dosage || !rythme) {
        return res.status(400).json({ message: 'All fields are required: medicationId, quantity, dosage.' });
      }
  
      // Créer la prescription dans la collection "prescriptions"
      const prescription = await db.collection('prescriptions').insertOne({
        userId: user._id, // Utilisation de l'_id de l'utilisateur trouvé
        medicationId,
        quantity,
        dosage,
        rythme
      });
  
      // Répondre avec un message de succès
      res.status(201).json({
        message: "Prescription created successfully",
        prescriptionId: prescription.insertedId,
      });
    } catch (error) {
      console.error("Error creating prescription:", error);
      res.status(500).json({ message: 'Error creating prescription' });
    }
  });
  

app.get('/api/list-prescriptions', checkJwt, async (req, res) => {
    try {
      // Récupérer le token du payload JWT
      const tokenFromJwt = req.auth.payload.sub;
      
      // Vérifier si un utilisateur avec ce token existe dans la base de données
      const user = await db.collection('users').findOne({ token: tokenFromJwt });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Une fois l'utilisateur trouvé, récupérer ses prescriptions en fonction du userId
      const prescriptions = await db.collection('prescriptions').find({ userId: user._id }).toArray();
  
      // Répondre avec les prescriptions
      res.status(200).json(prescriptions);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      res.status(500).json({ message: 'Error fetching prescriptions' });
    }
  });
  

  app.delete('/api/prescriptions/:id', checkJwt, async (req, res) => {
    try {
      const { id } = req.params;
      // Récupérer le token du payload JWT
      const tokenFromJwt = req.auth.payload.sub;

      // Vérifier si un utilisateur avec ce token existe dans la base de données
      const user = await db.collection('users').findOne({ token: tokenFromJwt });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Rechercher la prescription dans la collection "prescriptions"
      const prescription = await db.collection('prescriptions').findOne({ _id: new ObjectId(id) });
      if (!prescription) {
        return res.status(404).json({ message: 'Prescription not found' });
      }
  
      // Vérifier si l'utilisateur a les droits de supprimer cette prescription
      if (prescription.userId.toString() !== user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to delete this prescription' });
      }
  
      // Supprimer la prescription
      await db.collection('prescriptions').deleteOne({ _id: new ObjectId(id) });
  
      res.status(200).json({ message: 'Prescription deleted successfully' });
    } catch (error) {
      console.error("Error deleting prescription:", error);
      res.status(500).json({ message: 'Error deleting prescription' });
    }
  });
  

// Medicaments API
app.get('/api/medicaments', async (req, res) => {
  try {
    const medicaments = await db.collection('medicaments').find().toArray();
    res.status(200).json(medicaments);
  } catch (error) {
    console.error("Error fetching medicaments:", error);
    res.status(500).json({ message: 'Error fetching medicaments' });
  }
});

// Questionnaire and Questions APIs
app.post('/api/questionnaires', checkJwt, async (req, res) => {
  try {
    const { title, description, questions } = req.body;

    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({ message: 'Title and questions are required.' });
    }

    const newQuestionnaire = await db.collection('questionnaires').insertOne({
      title,
      description,
      questions,
    });

    res.status(201).json({ message: 'Questionnaire created successfully', questionnaireId: newQuestionnaire.insertedId });
  } catch (error) {
    console.error("Error creating questionnaire:", error);
    res.status(500).json({ message: 'Error creating questionnaire' });
  }
});

app.post('/api/questions', checkJwt, async (req, res) => {
  try {
    const { questionText, questionType, options } = req.body;

    if (!questionText || !questionType) {
      return res.status(400).json({ message: 'Question text and type are required.' });
    }

    const newQuestion = await db.collection('questions').insertOne({
      questionText,
      questionType,
      options,
    });

    res.status(201).json({ message: 'Question created successfully', questionId: newQuestion.insertedId });
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(500).json({ message: 'Error creating question' });
  }
});

// Réponse à un questionnaire
app.post('/api/responses', checkJwt, async (req, res) => {
  try {
    const { questionnaireId, answers } = req.body;
    const userId = req.auth.payload.sub;

    if (!questionnaireId || !answers || answers.length === 0) {
      return res.status(400).json({ message: 'Questionnaire ID and answers are required.' });
    }

    // Vérifier que toutes les questions du questionnaire sont répondues
    const questionnaire = await db.collection('questionnaires').findOne({ _id: new ObjectId(questionnaireId) });
    if (!questionnaire) {
      return res.status(404).json({ message: 'Questionnaire not found.' });
    }

    if (questionnaire.questions.length !== answers.length) {
      return res.status(400).json({ message: 'Please answer all questions.' });
    }

    const response = await db.collection('responses').insertOne({
      userId,
      questionnaireId,
      answers,
    });

    res.status(201).json({ message: 'Response recorded successfully', responseId: response.insertedId });
  } catch (error) {
    console.error("Error submitting response:", error);
    res.status(500).json({ message: 'Error submitting response' });
  }
});



app.post('/api/prescriptions', checkJwt, async (req, res) => {
    try {
      // Extraire les données de la requête
      const { medicationId, quantity, dosage } = req.body;
  console.log(medicationId, quantity, dosage)
      // Récupérer le token du payload JWT
      const tokenFromJwt = req.auth.payload.sub;
  
      // Vérifier si un utilisateur avec ce token existe dans la base de données
      const user = await db.collection('users').findOne({ token: tokenFromJwt });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Vérification de la présence des informations nécessaires
      if (!medicationId || !quantity || !dosage) {
        return res.status(400).json({ message: 'All fields are required: medicationId, quantity, dosage.' });
      }
  
      // Créer la prescription dans la collection "prescriptions"
      const prescription = await db.collection('prescriptions').insertOne({
        userId: user._id, // Utilisation de l'_id de l'utilisateur trouvé
        medicationId,
        quantity,
        dosage,
      });
  
      // Répondre avec un message de succès
      res.status(201).json({
        message: "Prescription created successfully",
        prescriptionId: prescription.insertedId,
      });
    } catch (error) {
      console.error("Error creating prescription:", error);
      res.status(500).json({ message: 'Error creating prescription' });
    }
  });




  app.post('/api/subscription', checkJwt, async (req, res) => {
    try {
      
      // Extraire les données de la requête
      const  webpushtoken  = JSON.stringify(req.body.webpushtoken);  // Le token WebPush
      const tokenFromJwt = req.auth.payload.sub;  // Le token d'authentification de l'utilisateur
      webPush.setVapidDetails(
        'mailto:sullivan-sextius@gmail.com',  // L'email de votre serveur
        'BGPhLwNAwJZguAqSPCFEbfN_TkH7tTpe5AVTvrQxAfWEb8-alQBJtx9VLsL3i2T1sWWOKYRabRWq1mRMocUDt4c', // Clé publique VAPID
        '8gw1gQaZkzk-GpQ5vM6Df9Jhw3kB2YKHig-_8686Kzk'  // Clé privée VAPID
      );
      // Vérifier si un utilisateur avec ce token existe dans la base de données
      const user = await db.collection('users').findOne({ token: tokenFromJwt });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const user_webpushtoken = await db.collection('webpushtokens').findOne({ userId: user._id, });
      if (user_webpushtoken && req.body.relance) {
          const existingRelance = await db.collection('relances').findOne({ userId: user._id, status: 'active' });
          if (existingRelance) {
            console.log(existingRelance)
            return res.status(400).json({ message: 'Relance already active' });
          } else {
             // Enregistrer une nouvelle relance
            const newRelance = await db.collection('relances').insertOne({
              userId: user._id, // L'identifiant de l'utilisateur lié à cette relance
              notificationId: notifications._id, // L'identifiant de la notification liée
              interval: 30, // Intervalle en minutes (par exemple : 30 minutes)
              nextSendTime: new Date(Date.now() + 30 * 60 * 1000), // Exemple : prochaine relance dans 30 minutes
              status: 'active', // Correspond au statut "actif" comme chaîne de caractères
              relancesCount: 0, // Initialement, aucune relance n'a été effectuée
              createdAt: new Date(), // Date de création
              updatedAt: new Date(), // Date de la dernière mise à jour (même valeur qu'au départ)
            });
          }
      }
        else {
          const subscription = await db.collection('webpushtokens').insertOne({
            userId: user._id, // Utiliser l'_id de l'utilisateur trouvé
            webpushtoken: webpushtoken,  // Le token WebPush reçu
          });
      }
      const payload = {
        notification: {
            title: 'Guardian Project - Notification',
            body: 'Souscription aux notifications activée',
            icon: 'assets/icons/icon-384x384.png',
            actions: [
                { action: 'bar', title: 'Action custom' },
                { action: 'baz', title: 'Une autre action' },
            ],
            data: {
                onActionClick: {
                    default: { operation: 'openWindow',url: "http://localhost:4200/notifications" },
                    bar: {
                        operation: 'focusLastFocusedOrOpen',
                        url: '/signin',
                    },
                    baz: {
                        operation: 'navigateLastFocusedOrOpen',
                        url: '/signin',
                    },
                },
            },
        },
    };
    webPush.sendNotification(req.body, JSON.stringify(payload));
    // Répondre avec un message de succès
    res.status(200).json({
      payload,
      message: "WebPush token created and notification sent successfully",
    });
  } catch (error) {
    console.error("Error creating webpushtoken or sending notification:", error);
    res.status(500).json({ message: 'Error creating webpushtoken or sending notification' });
  }
});

app.post('/api/notify', checkJwt, async (req, res) => {
  try {
    const notification_data = req.body;
    const tokenFromJwt = req.auth.payload.sub;
  
    // Vérifier si un utilisateur avec ce token existe dans la base de données
    const user = await db.collection('users').findOne({ token: tokenFromJwt });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }


    // Créer la prescription dans la collection "prescriptions"
    const notification_table = await db.collection('notifications').insertOne({
      userId: user._id, // Utilisation de l'_id de l'utilisateur trouvé
      title: notification_data.subscription.notification.title,
      body: notification_data.subscription.notification.body,
      status:"unread",
      icon:"/default-icon.png",
      badge:"/badge-icon.png",
      pris:false,
      date: new Date(),
      url:`${authConfig.appUri}`
    });
  
    res.status(200).json({
      message: 'Notification envoyée et enregistrée avec succès',
      notificationId: notification_table._id,
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi ou de l\'enregistrement de la notification:', error);
    res.status(500).json({ message: 'Erreur lors de l\'envoi ou de l\'enregistrement de la notification' });
  }
});

app.post('/api/start-relance', checkJwt, async (req, res) => {
  try {
    const tokenFromJwt = req.auth.payload.sub;

   const user = await db.collection('users').findOne({ token: tokenFromJwt });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    //console.log("TOKEN : ",user._id)
    // Vérifiez si une relance est déjà active
    const existingRelance = await db.collection('relances').findOne({ userId: user._id, status: 'active' });
    if (existingRelance) {
      console.log(existingRelance)
      return res.status(400).json({ message: 'Relance already active' });
    }
    const notifications = await db.collection('notifications').findOne({ userId:user._id });
    webPush.setVapidDetails(
      'mailto:sullivan-sextius@gmail.com',  // L'email de votre serveur
      'BGPhLwNAwJZguAqSPCFEbfN_TkH7tTpe5AVTvrQxAfWEb8-alQBJtx9VLsL3i2T1sWWOKYRabRWq1mRMocUDt4c', // Clé publique VAPID
      '8gw1gQaZkzk-GpQ5vM6Df9Jhw3kB2YKHig-_8686Kzk'  // Clé privée VAPID
    );

    // Enregistrer une nouvelle relance
    const newRelance = await db.collection('relances').insertOne({
      userId: user._id, // L'identifiant de l'utilisateur lié à cette relance
      notificationId: notifications._id, // L'identifiant de la notification liée
      interval: 30, // Intervalle en minutes (par exemple : 30 minutes)
      nextSendTime: new Date(Date.now() + 30 * 60 * 1000), // Exemple : prochaine relance dans 30 minutes
      status: 'active', // Correspond au statut "actif" comme chaîne de caractères
      relancesCount: 0, // Initialement, aucune relance n'a été effectuée
      createdAt: new Date(), // Date de création
      updatedAt: new Date(), // Date de la dernière mise à jour (même valeur qu'au départ)
    });
    console.log("RELANCES : ",newRelance)

    const intervalId = setInterval(async () => {
      console.log("NOTIFICATION RELANCE : ",newRelance)
      // Vérifier si la relance est toujours active
      const isActive = await db.collection('relances').findOne({ _id: newRelance.insertedId, status: 'active' });
    
      // Si la relance n'est plus active, on arrête l'intervalle
      if (!isActive) {
        clearInterval(intervalId); // Arrêter si la relance est annulée
        return;
      }
    
      // Récupérer les informations de l'utilisateur et de la notification
      const user = await db.collection('users').findOne({ _id: newRelance.userId });
      const userSubscription = await db.collection('webpushtokens').findOne({ userId: user._id });
      const notificationPayload = {
        notification: {
          title: 'Rappel - Relance Active',
          body: 'Ceci est une relance automatique.',
          icon: '/default-icon.png',
          data: { url: 'http://localhost:4200/notifications' }
        }
      };
    
      // Si l'utilisateur a un token de web push, envoyer la notification
      if (userSubscription) {
      console.log("SUBSCRIPTION : ",userSubscription.webpushtoken)
        webPush.sendNotification(JSON.parse(userSubscription.webpushtoken), JSON.stringify(notificationPayload))
          .then(response => {
            console.log('Notification envoyée', response);
          })
          .catch(err => {
            console.error('Erreur lors de l\'envoi de la notification', err);
          });
      }
    }, 2 * 60 * 1000); // Toutes les 2 minutes
    // Si une relance est annulée ou terminée, nettoyez l'intervalle
    await db.collection('relances').updateOne(
      { _id: newRelance.insertedId },
      { $set: { status: 'completed' } }
    );

    res.status(200).json({ message: 'Relance started successfully' });
  } catch (error) {
    console.error('Error starting relance:', error);
    res.status(500).json({ message: 'Error starting relance' });
  }
});

// Start server
const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API started on port ${port}`));
