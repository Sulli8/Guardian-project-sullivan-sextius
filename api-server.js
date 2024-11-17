const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const { auth } = require('express-oauth2-jwt-bearer');
const authConfig = require('./auth_config.json');

const app = express();

if (
  !authConfig.domain ||
  !authConfig.authorizationParams.audience ||
  ["YOUR_API_IDENTIFIER", "{yourApiIdentifier}"].includes(authConfig.authorizationParams.audience)
) {
  console.log(
    "Exiting: Please make sure that auth_config.json is in place and populated with valid domain and audience values"
  );

  process.exit();
}

app.use(morgan('dev'));
app.use(helmet());
app.use(
  cors({
    origin: authConfig.appUri,
  })
);
app.use(express.json()); // Pour analyser les corps JSON
app.use(express.urlencoded({ extended: true })); // Pour analyser les corps URL-encoded

const checkJwt = auth({
  audience: authConfig.authorizationParams.audience,
  issuerBaseURL: `https://${authConfig.domain}`,
});

app.get('/api/external', checkJwt, async (req, res) => {
  try {
    const userId = req.auth.payload.sub;  // Correction : accès à req.auth.payload.sub
    //const userInfo = await getUserInfo(userId);
    res.json(userId);
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ error: 'Unable to fetch user info' });
  }
});

app.post('/api/create_user',(req, res) => {
  try {
    console.log("Données reçues :", req.body);
    console.log("En-têtes reçus :", req.headers);
    res.status(200).json({ message: 'TEST' });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ error: 'Unable to fetch user info' });
  }
});




// Base de données fictive en mémoire pour les prescriptions
let prescriptions = [];

// Route POST pour ajouter un nouveau médicament et sa posologie
app.post('/prescriptions', checkJwt,(req, res) => {
  const { nom, posologie } = req.body;

  if (!nom || !posologie) {
    return res.status(400).json({ message: 'Nom du médicament et posologie requis' });
  }

  const newPrescription = {
    id: prescriptions.length + 1, // ID unique basé sur la longueur actuelle du tableau
    nom,
    posologie
  };

  prescriptions.push(newPrescription);
  res.status(201).json(newPrescription);
});

// Route GET pour récupérer la liste des médicaments et leurs posologies
app.get('/prescriptions', (req, res) => {
  res.status(200).json(prescriptions);
});

// Route PUT pour modifier la posologie ou les détails d'un médicament existant
app.put('/prescriptions/:id',checkJwt ,(req, res) => {
  const { id } = req.params;
  const { nom, posologie } = req.body;

  // Trouver la prescription par ID
  const prescriptionIndex = prescriptions.findIndex(p => p.id === parseInt(id));

  if (prescriptionIndex === -1) {
    return res.status(404).json({ message: 'Prescription non trouvée' });
  }

  // Mettre à jour les données de la prescription
  const updatedPrescription = {
    id: parseInt(id),
    nom: nom || prescriptions[prescriptionIndex].nom,
    posologie: posologie || prescriptions[prescriptionIndex].posologie
  };

  prescriptions[prescriptionIndex] = updatedPrescription;

  res.status(200).json(updatedPrescription);
});

// Route DELETE pour supprimer un médicament de la liste
app.delete('/prescriptions/:id',checkJwt ,(req, res) => {
  const { id } = req.params;

  // Trouver l'index de la prescription à supprimer
  const prescriptionIndex = prescriptions.findIndex(p => p.id === parseInt(id));

  if (prescriptionIndex === -1) {
    return res.status(404).json({ message: 'Prescription non trouvée' });
  }

  // Supprimer la prescription
  prescriptions.splice(prescriptionIndex, 1);

  res.status(200).json({ message: 'Prescription supprimée avec succès' });
});

const port = process.env.API_SERVER_PORT || 3001;

app.listen(port, () => console.log(`Api started on port ${port}`));
