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
sequelize.authenticate().then(() => {
console.log('Connection has been established successfully.');
})
.catch(err => {
console.error('Unable to connect to the database:', err);
});

Question = sequelize.define('question', {
    id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
    },
    groupId: {
        type: Sequelize.STRING(256),
        allowNull: false,
        defaultValue: ''
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

Group = sequelize.define('groups', {
    id: {
        type: Sequelize.STRING(32),
        primaryKey: true,
        allowNull: false,
        defaultValue: ''
    },
    groupName: {
        type: Sequelize.STRING(128),
        allowNull: false,
        defaultValue: ''
    },
    muteStatus: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0 // 0 未禁言、1 禁言
    },
    clientIds: {
        type: Sequelize.STRING(256),
        allowNull: false,
        defaultValue: ''
    }
})

// sequelize.sync({force: true}).then(()=>{
//     console.log('force update sucess')
// }).catch((err)=>{
//     console.log('err',err)
// })

module.exports = [sequelize, Question, Group]