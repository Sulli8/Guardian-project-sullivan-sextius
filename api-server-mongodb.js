const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
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
    origin: authConfig.appUri,
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

// Start server
const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API started on port ${port}`));
