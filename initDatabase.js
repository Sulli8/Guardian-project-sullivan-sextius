const sequelize = require('./database');
const User = require('./models-mysql/Users');
const WebPushToken = require('./models-mysql/WebPushToken');

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
