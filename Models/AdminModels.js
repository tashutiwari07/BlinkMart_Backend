const {DataTypes} = require('sequelize');
const sequelize = require('../Config/db');

const Admin = sequelize.define('Admin', {
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
    });

// exports = User; or

module.exports = Admin;