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

//db.action = sql.import(__dirname + '/models/actions.js');
//db.claim = sql.import(__dirname + '/models/claims.js');
db.reward = sql.import(__dirname + '/models/rewards.js');
db.task = sql.import(__dirname + '/models/tasks.js');
db.token = sql.import(__dirname + '/models/token.js');
db.user = sql.import(__dirname + '/models/user.js');

db.sql = sql;
db.Sequelize = Sequelize;


module.exports = db;