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

app.post('/users', function (req, res) {
    var body = _.pick(req.body, 'email', 'password');

    db.user
        .create(body)
        .then(function (user) {
            res.status(200).json(user.toPublicJSON());
        })
        .catch(function (e) {
            res.status(400).json(e);
        });
});

app.post('/users/login', function (req, res) {
    var body = _.pick(req.body, 'email', 'password'),
        user_instance;

    db.user
        .authenticate(body)
        .then(function (user) {
            var token = user.generateToken('authentication'),
                expiration_date = new Date();

            user_instance = user;
            expiration_date.setMinutes(expiration_date.getMinutes() + 30);

            return db.token
                .create({
                    token: token,
                    expiration: expiration_date
                });

        })
        .then(function (token_instance) {
            res.header('Auth', token_instance.get('token')).json(user_instance.toPublicJSON());
        })
        .catch(function (e) {
            res.status(401).send();
        });
});

app.delete('/users/login', middleware.requireAuthentication, function (req, res) {
    req.token
        .destroy()
        .then(function () {
            res.status(204).send();
        })
        .catch(function (e) {
            res.status(500).send();
        });
});

db.sql
    .sync({force: true})
    .then(function () {
            app.listen(PORT, function () {
                console.log('Express server listening on port ' + PORT);
            });
        }
    );