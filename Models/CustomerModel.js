const {DataTypes} = require('sequelize');
const sequelize = require('../Config/db');

const Customer = sequelize.define('Customer', {
    id: {
        type: DataTypes.INTEGER,    
        autoIncrement: true,
        primaryKey: true
    },  
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
          type: DataTypes.STRING,
          allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true,
    }
});

// exports = User; or

module.exports = Customer;