const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const { auth } = require('express-oauth2-jwt-bearer');
const authConfig = require('./auth_config.json');
//moedesl
const { User, Prescription } = require('./models'); 

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

app.post('/api/create_user', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validation des données reçues
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs sont requis: firstName, lastName, email, password.' });
    }

    // Vérification si l'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Un utilisateur avec cet email existe déjà.' });
    }

    // Création de l'utilisateur
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password, // Idéalement, hachez le mot de passe avant de l'enregistrer
    });

    // Réponse en cas de succès
    res.status(200).json({message:"Utilisateur inséré avec succès",newUser});
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur' });
  }
});


app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;  // Récupérer l'ID de l'utilisateur à modifier
    const { firstName, lastName, email, password } = req.body;  // Récupérer les données à mettre à jour

    // Vérifier si les données sont présentes dans le corps de la requête
    if (!firstName && !lastName && !email && !password) {
      return res.status(400).json({ message: 'Au moins un champ doit être fourni pour la mise à jour' });
    }

    // Trouver l'utilisateur dans la base de données par son ID
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Mettre à jour les informations de l'utilisateur
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.password = password || user.password;

    // Sauvegarder les modifications dans la base de données
    await user.save();

    // Répondre avec les données mises à jour
    res.status(200).json({ message: 'Utilisateur mis à jour avec succès', user });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de l\'utilisateur' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;  // Récupérer l'ID de l'utilisateur à supprimer

    // Trouver l'utilisateur dans la base de données par son ID
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Supprimer l'utilisateur de la base de données
    await user.destroy();

    // Répondre avec un message de succès
    res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de l\'utilisateur' });
  }
});



app.post('/api/subscription-web-push-token', async (req, res) => {
  try {
    const { token, userId } = req.body;

    // Vérifier que le token et l'ID de l'utilisateur sont fournis
    if (!token || !userId) {
      return res.status(400).json({ message: 'Le token et l\'ID utilisateur sont requis' });
    }

    // Vérifier si le token existe déjà pour l'utilisateur
    const existingToken = await WebPushToken.findOne({ where: { userId } });
    if (existingToken) {
      return res.status(400).json({ message: 'Ce utilisateur a déjà un token web push enregistré' });
    }

    // Créer un nouveau Web Push Token
    const newToken = await WebPushToken.create({
      token,
      userId,
    });

    // Réponse avec le token créé
    res.status(201).json({ message: 'Web Push Token ajouté avec succès', token: newToken });
  } catch (error) {
    console.error('Erreur lors de l\'insertion du Web Push Token:', error);
    res.status(500).json({ error: 'Impossible d\'insérer le Web Push Token' });
  }
});




// Base de données fictive en mémoire pour les prescriptions
let prescriptions = [];

// Route POST pour ajouter un nouveau médicament et sa posologie
app.post('/prescriptions', checkJwt, async (req, res) => {
  try {
    const { userId, medicamentId, quantity, dosage } = req.body;

    // Validation des données
    if (!userId || !medicamentId || !quantity || !dosage) {
      return res.status(400).json({ message: 'Tous les champs sont requis : userId, medicamentId, quantity, dosage' });
    }

    // Création de la prescription dans la base de données
    const newPrescription = await Prescription.create({
      userId,
      medicamentId,
      quantity,
      dosage,
    });

    // Réponse avec la prescription créée
    res.status(201).json(newPrescription);
  } catch (error) {
    console.error('Erreur lors de la création de la prescription :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création de la prescription.' });
  }
});

// Route GET pour récupérer la liste des médicaments et leurs posologies
app.get('/prescriptions', (req, res) => {
  res.status(200).json(prescriptions);
});

app.put('/prescriptions/:id', checkJwt, async (req, res) => {
  const { id } = req.params;
  const { nom, posologie } = req.body;

  try {
    // Chercher la prescription dans la base de données en utilisant l'ID
    const prescription = await Prescription.findOne({ where: { id } });

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription non trouvée' });
    }

    // Mettre à jour les champs de la prescription
    prescription.nom = nom || prescription.nom;
    prescription.posologie = posologie || prescription.posologie;

    // Sauvegarder les modifications
    await prescription.save();

    res.status(200).json(prescription);
  } catch (error) {
    console.error('Erreur lors de la modification de la prescription :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la modification de la prescription.' });
  }
});



app.delete('/prescriptions/:id', checkJwt, async (req, res) => {
  const { id } = req.params;

  try {
    // Chercher la prescription dans la base de données en utilisant l'ID
    const prescription = await Prescription.findOne({ where: { id } });

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription non trouvée' });
    }

    // Supprimer la prescription
    await prescription.destroy();

    res.status(200).json({ message: 'Prescription supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la prescription :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de la prescription.' });
  }
});



const port = process.env.API_SERVER_PORT || 3001;

app.listen(port, () => console.log(`Api started on port ${port}`));
