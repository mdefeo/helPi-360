var express = require('express'),
    body_parser = require('body-parser'),
    _ = require('underscore'),
    db = require('./db.js'),
    bcrypt = require('bcrypt'),
    middleware = require('./middleware.js')(db),
    app = express(),
    PORT = 3000;

app.use(body_parser.json());

app.get('/', function (req, res) {
    res.send('Welcome to the helPi');
});


db.sql
    .sync({force: true})
    .then(function () {
            app.listen(PORT, function () {
                console.log('Express server listening on port ' + PORT);
            });
        }
    );