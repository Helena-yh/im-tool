var Config, Group, Question;

var Sequelize =  require('sequelize');

Config = require('./conf');

sequelize = new Sequelize(Config.DB_NAME, Config.DB_USER, Config.DB_PASSWORD, {
    host: Config.DB_HOST,
    port: Config.DB_PORT,
    dialect: 'mysql',
    charset: 'utf8',
    dialectOptions: {
      charset: 'utf8',
    //   collate: 'utf8_general_ci'
    },
    timezone: '+08:00',
    logging: null
});

// 测试连接
// sequelize.authenticate().then(() => {
// console.log('Connection has been established successfully.');
// })
// .catch(err => {
// console.error('Unable to connect to the database:', err);
// });

Question = sequelize.define('question', {
    id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    description: {
        type: Sequelize.STRING(256),
        allowNull: false,
        defaultValue: ''
    },
    solution: {
        type: Sequelize.STRING(256),
        allowNull: false,
        defaultValue: ''
    },
    status: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0 // 0 未解决、 1 解决
    }
})


module.exports = [sequelize, Question]