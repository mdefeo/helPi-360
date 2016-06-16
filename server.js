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

/*
    USERS
 */
app.post('/users', function (req, res) {
    var body = _.pick(req.body, 'email', 'password', 'type');

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

/*
 END USERS
 */


/*
    TASKS
 */
app.post('/tasks', middleware.requireAuthentication, function (req, res) {
    var body = _.pick(req.body, 'name', 'points', 'description', 'active');

    if(req.user.get('type') !== 10) {
        db.tasks
            .create(body)
            .then(function (task) {
                res.status(200).json(task.toJSON());
            })
            .catch(function (e) {
                res.status(500).json(e);
            });
    } else {
        res.status(401).send();
    }
});

app.get('/tasks', middleware.requireAuthentication, function (req, res) {
    var query = req.query,
        where = {};

    if (query.hasOwnProperty('active') && query.completed === 'true') {
        where.active = true;
    } else if (query.hasOwnProperty('active') && query.completed === 'false') {
        where.active = false;
    }

    if (query.hasOwnProperty('q') && query.q.length > 0) {
        where.$or = [
            {
                description: {$like: '%' + query.q + '%'}
            },
            {
                name: {$like: '%' + query.q + '%'}
            }

        ];
    }

    db.tasks
        .findAll({where: where})
        .then(function (todos) {
            res.status(200).json(todos);
        })
        .catch(function (e) {
            res.status(500).json(e);
        });
});
/*
 END TASKS
 */

db.sql
    .sync({})
    .then(function () {
            app.listen(PORT, function () {
                console.log('Express server listening on port ' + PORT);
            });
        }
    );