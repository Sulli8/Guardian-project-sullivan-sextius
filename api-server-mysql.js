const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const { auth } = require('express-oauth2-jwt-bearer');
const authConfig = require('./auth_config.json');
//moedesl
const { Users, Prescription, Medicaments } = require('./models-mysql'); 

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
    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Un utilisateur avec cet email existe déjà.' });
    }

    // Création de l'utilisateur
    const newUser = await Users.create({
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
    const user = await Users.findByPk(id);

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
    const user = await Users.findByPk(id);

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
app.post('/api/prescriptions', checkJwt, async (req, res) => {
  try {
    const { medicationId, quantity, dosage } = req.body;
    const tokenFromRequest = req.auth.payload.sub;  // Utilisation de user.auth.payload.sub pour récupérer le token

    // Validation des données de la requête
    if (!medicationId || !quantity || !dosage) {
      return res.status(400).json({ message: 'Tous les champs sont requis : medicamentId, quantity, dosage.' });
    }

    // Vérifier si l'utilisateur existe en recherchant par le token
    const userExists = await Users.findOne({
      where: { token: tokenFromRequest }  // Recherche de l'utilisateur où le champ `token` correspond au token JWT
    });

    if (!userExists) {
      return res.status(404).json({ message: 'Utilisateur non trouvé ou token invalide.' });
    }

    // Créer la prescription dans la base de données
    const newPrescription = await Prescription.create({
      userId: userExists.id,  // Utilisation de l'ID de l'utilisateur trouvé
      medicamentId: medicationId,
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


app.get('/api/list-prescriptions', checkJwt, async (req, res) => {
  try {
    const tokenFromRequest = req.auth.payload.sub;  // Utilisation du `sub` dans le payload du token

    // Vérification si l'utilisateur existe en recherchant par le token
    const userExists = await Users.findOne({
      where: { token: tokenFromRequest }  // Recherche de l'utilisateur dont le `token` correspond à `sub`
    });

    if (!userExists) {
      return res.status(404).json({ message: 'Utilisateur non trouvé ou token invalide.' });
    }

    // Si l'utilisateur existe, récupérer ses prescriptions
    const prescriptions = await Prescription.findAll({
      where: { userId: userExists.id }
    });

    // Réponse avec la liste des prescriptions
    res.status(200).json(prescriptions);
  } catch (error) {
    console.error('Erreur lors de la récupération des prescriptions :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des prescriptions.' });
  }
});

app.get('/api/medicaments', async (req, res) => {
  try {
    // Récupérer tous les médicaments
    const medicaments = await Medicaments.findAll();

    // Réponse avec les données
    res.status(200).json(medicaments);
  } catch (error) {
    console.error('Erreur lors de la récupération des médicaments:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
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



app.delete('/api/prescriptions/:id', checkJwt, async (req, res) => {
  try {
    const prescriptionId = req.params.id;
    const userIdFromToken = req.auth.payload.sub; // L'ID de l'utilisateur provenant du token JWT
    
    // Vérifier si l'utilisateur existe dans la table Users
    const user = await Users.findOne({ where: { token: userIdFromToken } });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    // Vérifier si la prescription existe
    const prescription = await Prescription.findByPk(prescriptionId);
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription non trouvée.' });
    }

    // Vérifier que l'utilisateur authentifié est celui qui a créé la prescription
    if (prescription.userId !== user.id) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à supprimer cette prescription.' });
    }

    // Supprimer la prescription
    await prescription.destroy();

    res.status(200).json({ message: 'Prescription supprimée avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la prescription:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression.' });
  }
});



const port = process.env.API_SERVER_PORT || 3001;

app.listen(port, () => console.log(`Api started on port ${port}`));
