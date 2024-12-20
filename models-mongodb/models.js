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
  dosage: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },  // Reference to "Users"
  medicamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicaments', required: true }  // Reference to "Medicaments"
});
const Prescription = mongoose.model('Prescriptions', prescriptionSchema);  // Collection name in plural form

// Schema for Questionnaires
const questionnaireSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Questions' }]  // Reference to "Questions"
});
const Questionnaire = mongoose.model('Questionnaires', questionnaireSchema);  // Collection name in plural form

// Schema for Questions
const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  questionType: { type: String, required: true, enum: ['text', 'multiple_choice', 'boolean'] },
  responses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Responses' }]  // Reference to "Responses"
});
const Question = mongoose.model('Questions', questionSchema);  // Collection name in plural form

// Schema for Responses
const responseSchema = new mongoose.Schema({
  responseText: { type: String, required: true },
  isCorrect: { type: Boolean, default: false },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Questions', required: true }  // Reference to "Questions"
});
const Response = mongoose.model('Responses', responseSchema);  // Collection name in plural form

// Schema for Questionnaire-Question relationship (many-to-many)
const questionnaireQuestionSchema = new mongoose.Schema({
  questionnaireId: { type: mongoose.Schema.Types.ObjectId, ref: 'Questionnaires', required: true },  // Reference to "Questionnaires"
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Questions', required: true }  // Reference to "Questions"
});
const QuestionnaireQuestion = mongoose.model('QuestionnaireQuestions', questionnaireQuestionSchema);  // Collection name in plural form

// Schema for Question-Response relationship (many-to-many)
const questionResponseSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Questions', required: true },  // Reference to "Questions"
  responseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Responses', required: true }  // Reference to "Responses"
});
const QuestionResponse = mongoose.model('QuestionResponse', questionResponseSchema);  // Collection name in plural form

// Schema for Web Push Notification Tokens
const webPushTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },  // Reference to "Users"
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const WebPushToken = mongoose.model('WebPushTokens', webPushTokenSchema);  // Collection name in plural form

// Export the models
module.exports = {
  User,
  Medicament,
  Prescription,
  Questionnaire,
  Question,
  Response,
  QuestionnaireQuestion,
  QuestionResponse,
  WebPushToken
};
