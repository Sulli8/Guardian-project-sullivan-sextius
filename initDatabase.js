const sequelize = require('./database');
const User = require('./models/User');
const WebPushToken = require('./models/WebPushToken');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection à la base de données réussie.');

    await sequelize.sync({ force: true });
    console.log('Les tables ont été créées avec succès.');
  } catch (error) {
    console.error('Impossible de se connecter à la base de données:', error);
  } finally {
    await sequelize.close();
  }
})();
