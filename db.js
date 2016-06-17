var Sequelize = require('sequelize');
var env = 'development';
var sql;

if (env === 'production') {
    // todo: add production DB connection info

} else {
    sql = new Sequelize(undefined, undefined, undefined, {
        'dialect': 'sqlite',
        'storage': __dirname + '/data/helpi.sqlite'
    });
}
var db = {};

db.assigned = sql.import(__dirname + '/models/assigned.js');
db.claimed = sql.import(__dirname + '/models/claimed.js');
db.rewards = sql.import(__dirname + '/models/rewards.js');
db.tasks = sql.import(__dirname + '/models/tasks.js');
db.token = sql.import(__dirname + '/models/token.js');
db.user = sql.import(__dirname + '/models/user.js');

db.sql = sql;
db.Sequelize = Sequelize;


module.exports = db;