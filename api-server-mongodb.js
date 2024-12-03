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
//Questions
app.get('/api/questions', async (req, res) => {
  const questions = await db.collection('questions').find().toArray();
  res.status(200).json({ message: "Get question  successfully", questions: questions });
});
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
    const { medicationId, dosage, frequence, datePrescribed, timePrescribed } = req.body;
    console.log(req.body);

    // Récupérer le token du payload JWT
    const tokenFromJwt = req.auth.payload.sub;

    // Vérifier si un utilisateur avec ce token existe dans la base de données
    const user = await db.collection('users').findOne({ token: tokenFromJwt });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérification de la présence des informations nécessaires
    if (!medicationId || !dosage || !frequence) {
      return res.status(400).json({ message: 'Tous les champs sont requis : medicationId, dosage, frequence.' });
    }

    // Récupérer la date et l'heure actuelles
    const currentDate = new Date();
    const prescribedDateTime = new Date(`${datePrescribed}T${timePrescribed}:00`);
    // Créer la prescription dans la collection "prescriptions"
    const prescription = await db.collection('prescriptions').insertOne({
      userId: user._id, // Utilisation de l'_id de l'utilisateur trouvé
      medicationId,
      dosage,
      frequence, // Fréquence de la prescription
      datePrescribed: prescribedDateTime, // Date actuelle de la prescription
      timePrescribed: prescribedDateTime, // Heure actuelle de la prescription
    });

    // Vérifier si l'utilisateur a un `webpushtoken` (abonnement aux notifications)
    const webPushToken = await db.collection('webpushtokens').findOne({ userId: user._id });

    // Créer la notification avec isSubscribed en fonction de la présence du `webpushtoken`
    const isSubscribed = webPushToken ? true : false; // Si un `webpushtoken` existe, l'utilisateur est abonné.
    // Ensuite, insérer la notification avec la prescription ID et `isSubscribed`
    if (prescription.insertedId) {
        const notification = await db.collection('notifications').insertOne({
          userId: user._id, // ID de l'utilisateur
          title: 'Nouvelle prescription',
          body: `Vous avez une nouvelle prescription pour ${medicationId}.`,
          status: 'unread', // Statut par défaut
          prescriptionId: prescription.insertedId, // Référence à la prescription spécifique
          nbNotification: 0, // Nombre de notifications envoyées
          dateNotification: currentDate, // Date de la notification
          isSubscribed: isSubscribed, // `true` si l'utilisateur est abonné, `false` sinon
        });
    }

    // Répondre avec un message de succès
    res.status(201).json({
      message: "Prescription créée avec succès",
      prescriptionId: prescription.insertedId,
    });
  } catch (error) {
    console.error("Erreur lors de la création de la prescription :", error);
    res.status(500).json({ message: 'Erreur lors de la création de la prescription' });
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
 
 
// Route pour soumettre les réponses
app.post('/api/responses', checkJwt,async (req, res) => {
  try {
    // Récupérer l'ID utilisateur du token JWT
    const tokenFromJwt = req.auth.payload.sub;  // On suppose que le middleware de vérification de JWT a déjà rempli req.auth avec le payload du token

    // Vérifier si l'utilisateur existe dans la base de données
    const user = await db.collection('users').findOne({ token: tokenFromJwt });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

  
    // Si l'utilisateur existe, on passe à l'enregistrement des réponses
    const responses = req.body;  // Récupère les réponses envoyées par le frontend

    const responseDocs = responses.map((response) => ({
      userId: user._id,  // On associe la réponse à un utilisateur spécifique
      questionId: response.questionId,
      responseText: response.response.toString()
    }));

    // Insère toutes les réponses dans la collection 'responses'
    const result = await db.collection('responses').insertMany(responseDocs);

    res.status(200).json({
      message: 'Réponses enregistrées avec succès',
      insertedCount: result.insertedCount,  // Nombre de réponses insérées
    });
  } catch (error) {
    console.error('Erreur lors de l\'insertion des réponses:', error);
    res.status(500).json({ message: 'Erreur lors de l\'enregistrement des réponses' });
  }
});


app.get('/api/check-answers', checkJwt, async (req, res) => {
  try {
    const tokenFromJwt = req.auth.payload.sub;  // Récupérez l'ID de l'utilisateur depuis le token

    const responsesCollection = db.collection('responses');

    // Cherchez les réponses de cet utilisateur dans la collection
    const user = await db.collection('users').findOne({ token: tokenFromJwt });
    const userResponses = await responsesCollection.findOne({ userId: user._id });

    if (userResponses) {
      // L'utilisateur a déjà répondu
      return res.status(200).json({ message: 'Vous avez déjà répondu au questionnaire.' ,valeur:true});
    } else {
      // L'utilisateur n'a pas encore répondu
      return res.status(200).json({ message: 'Vous n\'avez pas encore répondu au questionnaire.', valeur :false });
    }
  } catch (error) {
    console.error('Erreur lors de la vérification des réponses:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
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

app.put('/api/unsubscribe', checkJwt, async (req, res) => {
  try {
    const tokenFromJwt = req.auth.payload.sub; 

    // Rechercher l'utilisateur dans la base de données
    const user = await db.collection('users').findOne({ token: tokenFromJwt });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Désabonner l'utilisateur dans la collection 'notifications'
    const updateNotificationResult = await db.collection('notifications').updateMany(
      { userId: user._id }, 
      { $set: { isSubscribed: false } }  
    );

    // Si des notifications ont été trouvées et mises à jour, ou si l'utilisateur n'a pas de notifications
    // (dans ce cas, on ne fait rien, mais on renvoie quand même un message de succès)
    if (updateNotificationResult.modifiedCount === 0) {
      console.log('Aucune notification à désabonner, l\'utilisateur peut ne pas avoir de notifications.');
    }

    // Supprimer le token WebPush de la collection 'webpushtokens'
    const deleteWebPushTokenResult = await db.collection('webpushtokens').deleteOne({ userId: user._id });
    
    // Vérifier si le token WebPush a bien été supprimé
    if (deleteWebPushTokenResult.deletedCount === 0) {
      console.log('Aucun token WebPush trouvé pour cet utilisateur.');
    }

    // Répondre avec un message de succès
    res.status(200).json({ message: 'Désabonnement effectué avec succès. Les notifications ont été désactivées et le token WebPush supprimé (si existant).' });
  } catch (error) {
    console.error('Erreur lors du désabonnement:', error);
    res.status(500).json({ message: 'Erreur serveur lors du désabonnement.' });
  }
});


app.get('/api/is-subscribe', checkJwt, async (req, res) => {
  try {
    // Récupérer l'ID de l'utilisateur à partir du token JWT
    const tokenFromJwt = req.auth.payload.sub;

    // Vérifier si un utilisateur avec ce token existe dans la base de données
    const user = await db.collection('users').findOne({ token: tokenFromJwt });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Récupérer l'ID de l'utilisateur
    const userId = user._id;

    // Vérifier si l'utilisateur est abonné aux notifications dans la collection "notifications"
    const notification = await db.collection('webpushtokens').findOne({ userId: userId});

    if (notification) {
      // L'utilisateur est abonné aux notifications
      return res.status(200).json({
        message: 'L\'utilisateur est abonné aux notifications.',
        isSubscribed: true,
      });
    } else {
      // L'utilisateur n'est pas abonné aux notifications
      return res.status(200).json({
        message: 'L\'utilisateur n\'est pas abonné aux notifications.',
        isSubscribed: false,
      });
    }
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'abonnement aux notifications:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la vérification de l\'abonnement' });
  }
});

app.put('/api/subscription', checkJwt, async (req, res) => {
  try {
    // Extraire les données de la requête (webpushtoken)
    const webpushtoken = req.body.webpushtoken;  // Le token WebPush envoyé par le client

    // Vérifier si le webpushtoken est bien défini
    if (!webpushtoken) {
      return res.status(400).json({ message: 'Le token de notification (webpushtoken) est manquant.' });
    }

    // Récupérer le token de l'utilisateur depuis le JWT (authentification)
    const tokenFromJwt = req.auth.payload.sub;  // Le token d'authentification de l'utilisateur

    // Configurer les détails VAPID pour l'envoi de notifications push
    webPush.setVapidDetails(
      'mailto:sullivan-sextius@gmail.com',  // L'email de votre serveur
      'BGPhLwNAwJZguAqSPCFEbfN_TkH7tTpe5AVTvrQxAfWEb8-alQBJtx9VLsL3i2T1sWWOKYRabRWq1mRMocUDt4c',  // Clé publique VAPID
      '8gw1gQaZkzk-GpQ5vM6Df9Jhw3kB2YKHig-_8686Kzk'  // Clé privée VAPID
    );

    // Vérifier si l'utilisateur existe dans la base de données
    const user = await db.collection('users').findOne({ token: tokenFromJwt });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    // Ajouter ou mettre à jour le token webPush dans la base de données
    const user_webpushtoken = await db.collection('webpushtokens').findOne({ userId: user._id });

    if (user_webpushtoken) {
      // Si le token existe déjà, le mettre à jour
      await db.collection('webpushtokens').updateOne(
        { userId: user._id },
        { $set: { webpushtoken } }
      );
    } else {
      // Si le token n'existe pas, l'ajouter
      await db.collection('webpushtokens').insertOne({
        userId: user._id,
        webpushtoken
      });
    }

    // Mise à jour de la colonne `isSubscribed` dans la collection `notifications`
    const updateNotificationsResult = await db.collection('notifications').updateMany(
      { userId: user._id },
      { $set: { isSubscribed: true } }
    );

    // Vérifier si des notifications ont été mises à jour
    if (updateNotificationsResult.modifiedCount === 0) {
      console.log('Aucune notification mise à jour pour cet utilisateur.');
    }

    // Préparer le payload de la notification
    const payload = {
      notification: {
        title: 'Guardian Project - Notification',
        body: 'Souscription aux notifications activée.',
        icon: 'assets/icons/icon-384x384.png',
        actions: [
          { action: 'bar', title: 'Action custom' },
          { action: 'baz', title: 'Une autre action' }
        ],
        data: {
          onActionClick: {
            default: { operation: 'openWindow', url: "http://localhost:4200/notifications" },
            bar: { operation: 'focusLastFocusedOrOpen', url: '/signin' },
            baz: { operation: 'navigateLastFocusedOrOpen', url: '/signin' }
          }
        }
      }
    };

    // Envoyer la notification WebPush
    await webPush.sendNotification(webpushtoken, JSON.stringify(payload));

    // Répondre avec un message de succès
    res.status(200).json({
      message: 'Souscription aux notifications réussie et notification envoyée.',
      payload
    });

  } catch (error) {
    console.error("Erreur lors de la création du WebPushToken ou de l'envoi de la notification:", error);
    res.status(500).json({ message: 'Erreur serveur lors de la création du WebPushToken ou de l\'envoi de la notification.' });
  }
});
app.get('/api/get-notifications', checkJwt, async (req, res) => {
  try {
    // Recherche des notifications dans la base de données
    const notifications = await db.collection("notifications").find().toArray(); // Tu peux ajouter des filtres ici si besoin
    // Retourner les notifications trouvées en JSON
    console.log(notifications)
    res.status(200).json({message:"Notification recupérer avec succès",notifications});
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.get('/api/get-user', checkJwt, async (req, res) => {
  try {
    const tokenFromJwt = req.auth.payload.sub;  // On suppose que le middleware de vérification de JWT a déjà rempli req.auth avec le payload du token

    // Vérifier si l'utilisateur existe dans la base de données
    const user = await db.collection('users').find({ token: tokenFromJwt }).toArray();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({message:"Utilisateur recupérer avec succès",user});
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.post('/api/check-subscribed-notify', checkJwt, async (req, res) => {
  webPush.setVapidDetails(
    'mailto:sullivan-sextius@gmail.com',  // L'email de votre serveur
    'BGPhLwNAwJZguAqSPCFEbfN_TkH7tTpe5AVTvrQxAfWEb8-alQBJtx9VLsL3i2T1sWWOKYRabRWq1mRMocUDt4c',  // Clé publique VAPID
    '8gw1gQaZkzk-GpQ5vM6Df9Jhw3kB2YKHig-_8686Kzk'  // Clé privée VAPID
  );
  try {
    // Récupérer l'ID de l'utilisateur à partir du token JWT
    const tokenFromJwt = req.auth.payload.sub;
    const user = await db.collection('users').findOne({ token: tokenFromJwt });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    const subscription = db.collection('notifications').find(n => n.isSubscribed === true);
    if (!subscription) {
      return res.status(400).json({ message: 'L\'utilisateur n\'est pas abonné aux notifications.' });
    }
    const userId = user._id;
   
    const notifications = await db.collection('notifications').find({ userId: userId }).toArray();
    for (let i = 0; i < notifications.length; i++) {
      const notification = notifications[i];
      const prescriptionId = notifications[i].prescriptionId
      const notificationDate = new Date(notification.dateNotification); 
      const currentTime = new Date();
      const prescription = await db.collection('prescriptions').findOne({ _id: prescriptionId });
      const payload = {
        notification: {
          title: 'Guardian Project - Notification'+notification.title,
          body: notification.body,
          icon: 'assets/icons/icon-guardian-project-notification.png',
          actions: [
            { action: 'bar', title: 'Action custom' },
            { action: 'baz', title: 'Une autre action' },
          ],
          data: {
            onActionClick: {
              default: { operation: 'openWindow', url: `${authConfig.appUri}/home-page?read=`+notification._id},
              bar: { operation: 'focusLastFocusedOrOpen', url: '/signin' },
              baz: { operation: 'navigateLastFocusedOrOpen', url: '/signin' },
            },
          },
        },
      };
      if(prescription){
        let datePrescribed = new Date(prescription.timePrescribed)
        if(prescription.frequence == "1 fois par jour" &&  
          datePrescribed.getUTCHours() == currentTime.getUTCHours() && 
          datePrescribed.getMinutes() == currentTime.getMinutes() && 
          notification.nbNotification < 1
        ){
          await webPush.sendNotification(req.body.webpushtoken, JSON.stringify(payload));
          let newNbNotification = notification.nbNotification + 1;
          const updatedNotification = await db.collection('notifications').findOneAndUpdate(
            { _id: notification._id },  // Critère de recherche pour l'ID spécifique
            {
              $set: {
                dateNotification: currentTime,   // Mettre à jour la date de notification
                nbNotification: newNbNotification // Incrémenter le nombre de notifications
              }
            },
            { returnDocument: 'after' } // Retourne le document après mise à jour
          );
          if (updatedNotification) {
            console.log(updatedNotification)
            return res.status(200).json({ message: 'Notification envoyée avec succès', updatedNotification });
          } else {
            return res.status(404).json({ message: 'Notification non trouvée' });
          }
          
          } else {
            const increment = await db.collection('notifications').findOneAndUpdate(
              { _id: notification._id },  // Critère de recherche pour l'ID spécifique
              {
                $set: {
                  dateNotification: currentTime, 
                  nbNotification: 0
                }
              },
              { returnDocument: 'after' } // Retourne le document après mise à jour
            );

            if (increment) {
             
              return res.status(200).json({ message: 'Nombre de Notification remis à zéro ' });
            } 
          }

          const diffMinutes = Math.abs(datePrescribed.getTime() - currentTime.getTime()) / (1000 * 60);
          if (prescription.frequence == "2 fois par jour" &&
              (diffMinutes == 30) &&
              notification.nbNotification < 2) {
            await webPush.sendNotification(req.body.webpushtoken, JSON.stringify(payload));
            let newNbNotification = notification.nbNotification + 1;
            const updatedNotification = await db.collection('notifications').findOneAndUpdate(
              { _id: notification._id },  // Critère de recherche pour l'ID spécifique
              {
                $set: {
                  dateNotification: currentTime,   // Mettre à jour la date de notification
                  nbNotification: newNbNotification // Incrémenter le nombre de notifications
                }
              },
              { returnDocument: 'after' } // Retourne le document après mise à jour
            );
            if (updatedNotification) {
              console.log(updatedNotification)
              return res.status(200).json({ message: 'Notification envoyée avec succès', updatedNotification });
            } else {
              return res.status(404).json({ message: 'Notification non trouvée' });
            }
            
            } else {
              const increment = await db.collection('notifications').findOneAndUpdate(
                { _id: notification._id },  // Critère de recherche pour l'ID spécifique
                {
                  $set: {
                    dateNotification: currentTime, 
                    nbNotification: 0
                  }
                },
                { returnDocument: 'after' } // Retourne le document après mise à jour
              );
  
              if (increment) {
               
                return res.status(200).json({ message: 'Nombre de Notification remis à zéro ', updatedNotification });
              } 
            }

            if (prescription.frequence == "Toutes les 10 minutes" && diffMinutes == 10) {
              await webPush.sendNotification(req.body.webpushtoken, JSON.stringify(payload));
             
              const updatedNotification = await db.collection('notifications').findOneAndUpdate(
                { _id: notification._id }, 
                {
                  $set: {
                    dateNotification: currentTime
                  }
                },
                { returnDocument: 'after' } // Retourne le document après mise à jour
              );
            
              // Vérifier si la notification a bien été mise à jour
              if (updatedNotification) {
                console.log(updatedNotification);
                return res.status(200).json({ message: 'Notification envoyée avec succès', updatedNotification });
              } else {
                return res.status(404).json({ message: 'Notification non trouvée' });
              }
            }
            

              if (prescription.frequence == "Toutes les 4 heures" && diffMinutes == 240) {
                // Envoi de la notification
                await webPush.sendNotification(req.body.webpushtoken, JSON.stringify(payload));
              
         
                const updatedNotification = await db.collection('notifications').findOneAndUpdate(
                  { _id: notification._id },  // Critère de recherche pour l'ID spécifique
                  {
                    $set: {
                      dateNotification: currentTime
                
                    }
                  },
                  { returnDocument: 'after' } // Retourne le document après mise à jour
                );
              
                if (updatedNotification) {
                  console.log(updatedNotification);
                  return res.status(200).json({ message: 'Notification envoyée avec succès', updatedNotification });
                } else {
                  return res.status(404).json({ message: 'Notification non trouvée' });
                }
              }


              if (prescription.frequence == "Toutes les 8 heures" && diffMinutes == 480) {
                // Envoi de la notification
                await webPush.sendNotification(req.body.webpushtoken, JSON.stringify(payload));
              
             
                const updatedNotification = await db.collection('notifications').findOneAndUpdate(
                  { _id: notification._id },  // Critère pour trouver la notification
                  {
                    $set: {
                      dateNotification: currentTime   // Mettre à jour la date de notification
       
                    }
                  },
                  { returnDocument: 'after' } // Retourne le document après mise à jour
                );
              
                // Vérifier si la notification a bien été mise à jour
                if (updatedNotification) {
                  console.log(updatedNotification);
                  return res.status(200).json({ message: 'Notification envoyée avec succès', updatedNotification });
                } else {
                  return res.status(404).json({ message: 'Notification non trouvée' });
                }
              }

              if (prescription.frequence == "Toutes les 12 heures" && diffMinutes == 720) {
            
                await webPush.sendNotification(req.body.webpushtoken, JSON.stringify(payload));
              
              
                const updatedNotification = await db.collection('notifications').findOneAndUpdate(
                  { _id: notification._id },  // Critère pour trouver la notification
                  {
                    $set: {
                      dateNotification: currentTime
                    }
                  },
                  { returnDocument: 'after' } // Retourne le document après mise à jour
                );
              
                // Vérifier si la notification a bien été mise à jour
                if (updatedNotification) {
                  console.log(updatedNotification);
                  return res.status(200).json({ message: 'Notification envoyée avec succès', updatedNotification });
                } else {
                  return res.status(404).json({ message: 'Notification non trouvée' });
                }
              }

              const diffMilliseconds = Math.abs(datePrescribed.getTime() - currentTime.getTime());
              const diffSeconds = Math.floor(diffMilliseconds / 1000); // Différence en secondes
              
              // Vérification si la fréquence est toutes les 30 secondes
              if (prescription.frequence == "Toutes les 30 secondes" && diffSeconds % 30 === 0) {
                // Envoi de la notification
                await webPush.sendNotification(req.body.webpushtoken, JSON.stringify(payload));
                      
                const updatedNotification = await db.collection('notifications').findOneAndUpdate(
                  { _id: notification._id },  // Critère pour trouver la notification
                  {
                    $set: {
                      dateNotification: currentTime
                    }
                  },
                  { returnDocument: 'after' } // Retourne le document après mise à jour
                );
              
                // Vérifier si la notification a bien été mise à jour
                if (updatedNotification) {
                  console.log(updatedNotification);
                  return res.status(200).json({ message: 'Notification envoyée avec succès', updatedNotification });
                } else {
                  return res.status(404).json({ message: 'Notification non trouvée' });
                }
              }
              
              
      }
     
    }

 

    return res.status(200).json({ message: 'Aucune notification à envoyer à ce moment.' });

  } catch (error) {
    console.error('Erreur lors de l\'envoi ou de l\'enregistrement de la notification:', error);
    res.status(500).json({ message: 'Erreur lors de l\'envoi ou de l\'enregistrement de la notification' });
  }
});




app.post('/api/start-relance', checkJwt, async (req, res) => {
});

// Start server
const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API started on port ${port}`));
