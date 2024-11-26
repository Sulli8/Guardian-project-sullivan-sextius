const mongoose = require('mongoose');

// Schema for Users
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  token: { type: String, required: true }
});
const User = mongoose.model('Users', userSchema);  // Collection name in plural form

// Schema for Medicaments
const medicamentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  description: { type: String }
});
const Medicament = mongoose.model('Medicaments', medicamentSchema);  // Collection name in plural form

// Schema for Prescriptions
const prescriptionSchema = new mongoose.Schema({
  quantity: { type: Number, required: true },
  rythme: { type: Number, required: true },
  dosage: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },  // Reference to "Users"
  medicamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicaments', required: true }  // Reference to "Medicaments"
});
const Prescription = mongoose.model('Prescriptions', prescriptionSchema);  // Collection name in plural form

const questionSchema = new mongoose.Schema({
  step: Number,
  text: String,
  type: String
});
const Question = mongoose.model('Questions', questionSchema);  // Collection name in plural form

const responseSchema = new mongoose.Schema({
  // Le texte ou la réponse donnée par l'utilisateur
  responseText: {
    type: mongoose.Schema.Types.Mixed,  // Type mixte pour accepter différentes formes (texte, booléen, etc.)
    required: true
  },
  
  // ID de la question à laquelle cette réponse appartient
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',  // Référence au modèle 'Question'
    required: true
  },
  
  // ID de l'utilisateur ayant répondu
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Référence au modèle 'User'
    required: true
  },
  
  // Date et heure de la réponse
  createdAt: {
    type: Date,
    default: Date.now  // Par défaut, la date est l'heure actuelle
  }
});
const Response = mongoose.model('Response', responseSchema);  // Collection name in plural form


// Schema for Web Push Notification Tokens
const webPushTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },  // Reference to "Users"
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const WebPushToken = mongoose.model('WebPushTokens', webPushTokenSchema);  // Collection name in plural form

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users', // Référence à la collection "users"
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: '/default-icon.png',
  },
  badge: {
    type: String,
    default: '/badge-icon.png',
  },
  status: {
    type: String,
    enum: ['unread', 'read','taken'],
    default: 'unread',
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
  url: String, // Optionnel, lien de redirection
  data: {
    type: Object,
    default: {}, // Données supplémentaires (par exemple, pour stocker des actions spécifiques)
  },
});

const Notification = mongoose.model('Notification', notificationSchema);


// Définir le schéma pour les relances
const relanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  notificationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification',
    required: true,
  },
  interval: {
    type: Number,
    required: true, // Intervalle en minutes entre les relances
  },
  nextSendTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'stopped', 'completed'],
    default: 'active',
  },
  relancesCount: {
    type: Number,
    default: 0, // Nombre de relances déjà effectuées
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware pour mettre à jour le champ updatedAt à chaque modification
relanceSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});
const Relances = mongoose.model('Relances', relanceSchema);


// Export the models
module.exports = {
  User,
  Relances,
  Notification,
  Medicament,
  Prescription,
  Question,
  Response,
  WebPushToken
};
