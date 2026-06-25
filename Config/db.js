const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('blinkit2.0', 'root', '', {
  host: 'localhost',
  dialect: 'mysql'
});

const initialize = async () => {
  await sequelize.authenticate();
  console.log('Database connected successfully.');
};

module.exports = sequelize;
module.exports.sequelize = sequelize;
module.exports.initialize = initialize;
