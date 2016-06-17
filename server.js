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

app.get('/users/:id/history', middleware.requireAuthentication, function (req, res) {
    var query = req.query,
        where = {};

    if (query.hasOwnProperty('user') && query.user.length > 0) {
        where.id = query.user;
    }

    db.user
        .findAll({
            attributes: ['id', 'email', 'type'],
            where: where,
            include: [
                {
                    model: db.assigned,
                    include: [
                        {
                            model: db.tasks
                        }
                    ]
                },
                {
                    model: db.claimed,
                    include: [
                        {
                            model: db.rewards
                        }
                    ]
                }]
        })
        .then(function (user) {
            user.forEach(function(user){
                user.dataValues.balance = 0;

                user.actions.forEach(function(action){
                   if(action.statusId === 3){
                       user.dataValues.balance += action.task.points;
                   }
                });

                user.claims.forEach(function(claim){
                   if(claim.statusId ===3){
                       user.dataValues.balance -= claim.reward.points;
                   }
                });
            });

            res.status(200).json(user);
        })
        .catch(function (e) {
            res.status(500).json(e);
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
    var body = _.pick(req.body, 'name', 'points', 'description');

    if (req.user.get('type') !== 10) {
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
        .then(function (tasks) {
            res.status(200).json(tasks);
        })
        .catch(function (e) {
            res.status(500).json(e);
        });
});


app.get('/tasks/:id', middleware.requireAuthentication, function (req, res) {
    var taskID = parseInt(req.params.id, 10);
    task =

        db.tasks.findOne({
            where: {id: taskID}
        }).then(function (task) {
            if (task) {
                res.json(task.toJSON());
            } else {
                res.status(404).send();
            }
        }, function (e) {
            res.status(500).send();
        });
});

app.delete('/tasks/:id', middleware.requireAuthentication, function (req, res) {
    var taskID = parseInt(req.params.id, 10);

    if (req.user.get('type') !== 10) {
        db.tasks
            .destroy({
                where: {id: taskID}
            }).then(function (deleted) {
            if (deleted === 0) {
                res.status(404).json({"error": "No task found with that id."});
            } else {
                res.status(204).send();
            }
        }, function (e) {
            res.status(500).send();
        });
    } else {
        res.status(401).send();
    }
});

app.put('/tasks/:id', middleware.requireAuthentication, function (req, res) {
    var body = _.pick(req.body, 'name', 'points', 'description'),
        taskID = parseInt(req.params.id, 10),
        attributes = {};

    if (req.user.get('type') !== 10) {
        if (body.hasOwnProperty('name')) {
            attributes.name = body.name.trim();
        }

        if (body.hasOwnProperty('points')) {
            attributes.points = body.points;
        }

        if (body.hasOwnProperty('description')) {
            attributes.description = body.description.trim();
        }

        db.tasks.findOne({
            where: {id: taskID}
        }).then(function (task) {
            if (task) {
                task.update(attributes).then(function (task) {
                    res.json(task.toJSON());
                }, function (e) {
                    res.status(400).json(e);
                });
            } else {
                res.status(404).send();
            }
        }, function () {
            res.status(500).send();
        });
    } else {
        res.status(401).send();
    }
});
/*
 END TASKS
 */

/*
 REWARDS
 */
app.post('/rewards', middleware.requireAuthentication, function (req, res) {
    var body = _.pick(req.body, 'name', 'points', 'description');

    if (req.user.get('type') !== 10) {
        db.rewards
            .create(body)
            .then(function (reward) {
                res.status(200).json(reward.toJSON());
            })
            .catch(function (e) {
                res.status(500).json(e);
            });
    } else {
        res.status(401).send();
    }
});

app.get('/rewards', middleware.requireAuthentication, function (req, res) {
    var query = req.query,
        where = {};

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

    db.rewards
        .findAll({where: where})
        .then(function (rewards) {
            res.status(200).json(rewards);
        })
        .catch(function (e) {
            res.status(500).json(e);
        });
});

app.get('/rewards/:id', middleware.requireAuthentication, function (req, res) {
    var rewardID = parseInt(req.params.id, 10);
    reward =

        db.rewards.findOne({
            where: {id: rewardID}
        }).then(function (reward) {
            if (reward) {
                res.json(reward.toJSON());
            } else {
                res.status(404).send();
            }
        }, function (e) {
            res.status(500).send();
        });
});

app.delete('/rewards/:id', middleware.requireAuthentication, function (req, res) {
    var rewardID = parseInt(req.params.id, 10);

    if (req.user.get('type') !== 10) {
        db.rewards
            .destroy({
                where: {id: rewardID, userId: req.user.get('id')}
            }).then(function (deleted) {
            if (deleted === 0) {
                res.status(404).json({"error": "No reward found with that id."});
            } else {
                res.status(204).send();
            }
        }, function (e) {
            res.status(500).send();
        });
    } else {
        res.status(401).send();
    }
});

app.put('/rewards/:id', middleware.requireAuthentication, function (req, res) {
    var body = _.pick(req.body, 'name', 'points', 'description'),
        rewardID = parseInt(req.params.id, 10),
        attributes = {};

    if (req.user.get('type') !== 10) {
        if (body.hasOwnProperty('name')) {
            attributes.name = body.name.trim();
        }

        if (body.hasOwnProperty('points')) {
            attributes.points = body.points;
        }

        if (body.hasOwnProperty('description')) {
            attributes.description = body.description.trim();
        }

        db.rewards.findOne({
            where: {id: rewardID}
        }).then(function (reward) {
            if (reward) {
                reward.update(attributes).then(function (reward) {
                    res.json(reward.toJSON());
                }, function (e) {
                    res.status(400).json(e);
                });
            } else {
                res.status(404).send();
            }
        }, function () {
            res.status(500).send();
        });
    } else {
        res.status(401).send();
    }
});

/*
 END REWARDS
 */



/*
 ASSIGNED
 */
app.post('/assigned', middleware.requireAuthentication, function (req, res) {
    var body = _.pick(req.body, 'user', 'task'),
        attributes = {
            userId: body.user,
            taskId: body.task
        };

    if (req.user.get('type') !== 10) {
        db.assigned
            .create(attributes)
            .then(function (assigned) {
                res.status(200).json(assigned.toJSON());
            })
            .catch(function (e) {
                res.status(500).json(e);
            });
    } else {
        res.status(401).send();
    }
});

app.get('/assigned', middleware.requireAuthentication, function (req, res) {
    var query = req.query,
        where = {};

    if (query.hasOwnProperty('user') && query.user.length > 0) {
        where.userId = query.user;
    }

    if (query.hasOwnProperty('task') && query.task.length > 0) {
        where.taskId = query.task;
    }

    if (query.hasOwnProperty('status') && query.status.length > 0) {
        where.statusId = query.status;
    }

    db.assigned
        .findAll({where: where})
        .then(function (assigned) {
            res.status(200).json(assigned);
        })
        .catch(function (e) {
            res.status(500).json(e);
        });
});

app.get('/assigned/:id', middleware.requireAuthentication, function (req, res) {
    var assigned_id = parseInt(req.params.id, 10);

    db.assigned
        .findOne({
            where: {id: assigned_id}
        }).then(function (assigned) {
            if (assigned) {
                res.status(200).json(assigned.toJSON());
            } else {
                res.status(404).send();
            }
        })
        .catch(function (e) {
            res.status(500).send();
        });
});

app.delete('/assigned/:id', middleware.requireAuthentication, function (req, res) {
    var assigned_id = parseInt(req.params.id, 10);

    if (req.user.get('type') !== 10) {
        db.assigned
            .destroy({
                where: {id: assigned_id}
            }).then(function (deleted) {
            if (deleted === 0) {
                res.status(404).json({"error": "No assigned found with that id."});
            } else {
                res.status(204).send();
            }
        }, function (e) {
            res.status(500).send();
        });
    } else {
        res.status(401).send();
    }
});

app.put('/assigned/:id', middleware.requireAuthentication, function (req, res) {
    var body = _.pick(req.body, 'user', 'status'),
        assigned_id = parseInt(req.params.id, 10),
        attributes = {};

    if (req.user.get('type') !== 10) {
        if (body.hasOwnProperty('user')) {
            attributes.userId = body.user;
        }

        if (body.hasOwnProperty('status')) {
            attributes.statusId = body.status;
        }

        if (body.hasOwnProperty('authorize')) {
            attributes.authUserID = req.user.get('id');
        }

        db.assigned
            .findOne({
                where: {id: assigned_id}
            })
            .then(function (assigned) {
                if (assigned) {
                    assigned
                        .update(attributes)
                        .then(function (assigned) {
                            res.json(assigned.toJSON());
                        }, function (e) {
                            res.status(400).json(e);
                        });
                } else {
                    res.status(404).send();
                }
            })
            .catch(function (e) {
                res.status(500).send();
            });
    } else if (req.user.get('type') === 10) {
        if (body.hasOwnProperty('status') && (body.status === 1 || body.status === 2)) {
            attributes.status = body.status;
        }

        db.assigned
            .findOne({
                where: {id: assigned_id}
            })
            .then(function (assigned) {
                if (assigned) {
                    assigned
                        .update(attributes)
                        .then(function (assigned) {
                            res.json(assigned.toJSON());
                        }, function (e) {
                            res.status(400).json(e);
                        });
                } else {
                    res.status(404).send();
                }
            })
            .catch(function (e) {
                res.status(500).send();
            });
    } else {
        res.status(401).send();
    }
});


/*
 END ASSIGNED
 */



/*
 CLAIMED
 */
app.post('/claimed', middleware.requireAuthentication, function (req, res) {
    var body = _.pick(req.body, 'user', 'reward', 'status'),
        attributes = {};

    if (req.user.get('type') !== 10 && body.hasOwnProperty('user') && body.hasOwnProperty('reward')) {
        attributes.userId = body.user;
        attributes.rewardId = body.reward;

        if (body.hasOwnProperty('statusId')) {
            attributes.statusId = body.status;
        }

        db.claimed
            .create(attributes)
            .then(function (claimed) {
                res.status(200).json(claimed.toJSON());
            })
            .catch(function (e) {
                res.status(500).json(e);
            });
    } else if (req.user.get('type') === 10 && body.hasOwnProperty('user') && body.hasOwnProperty('reward')) {
        attributes.userId = body.user;
        attributes.rewardId = body.reward;
        attributes.statusId = 1;

        db.claimed
            .create(attributes)
            .then(function (claimed) {
                res.status(200).json(claimed.toJSON());
            })
            .catch(function (e) {
                res.status(500).json(e);
            });
    } else {
        res.status(401).send();
    }
});

app.get('/claimed', middleware.requireAuthentication, function (req, res) {
    var query = req.query,
        where = {};

    if (query.hasOwnProperty('user') && query.user.length > 0) {
        where.userId = query.user;
    }

    if (query.hasOwnProperty('reward') && query.reward.length > 0) {
        where.rewardId = query.reward;
    }

    if (query.hasOwnProperty('status') && query.status.length > 0) {
        where.statusId = query.status;
    }

    db.claimed
        .findAll({
            where: where,
            include: [{
                model: db.rewards
            }]
        })
        .then(function (claimed) {
            res.status(200).json(claimed);
        })
        .catch(function (e) {
            res.status(500).json(e);
        });
});

app.get('/claimed/:id', middleware.requireAuthentication, function (req, res) {
    var claimed_id = parseInt(req.params.id, 10);

    db.claimed
        .findOne({
            where: {id: claimed_id}
        }).then(function (claimed) {
            if (claimed) {
                res.status(200).json(claimed.toJSON());
            } else {
                res.status(404).send();
            }
        })
        .catch(function (e) {
            res.status(500).send();
        });
});

app.delete('/claimed/:id', middleware.requireAuthentication, function (req, res) {
    var claimed_id = parseInt(req.params.id, 10);

    if (req.user.get('type') !== 10) {
        db.claimed
            .destroy({
                where: {id: claimed_id}
            }).then(function (deleted) {
            if (deleted === 0) {
                res.status(404).json({"error": "No claimed found with that id."});
            } else {
                res.status(204).send();
            }
        }, function (e) {
            res.status(500).send();
        });
    } else if (req.user.get('type') === 10) {
        db.claimed
            .findOne({
                where: {id: claimed_id}
            })
            .then(function (claimed) {
                if (claimed.statusId === 1) {
                    claimed
                        .destroy()
                        .then(function (deleted) {
                            if (deleted === 0) {
                                res.status(404).json({"error": "No claimed found with that id."});
                            } else {
                                res.status(204).send();
                            }
                        }, function (e) {
                            res.status(500).send();
                        });
                } else {
                    res.status(404).send();
                }
            })
            .catch(function (e) {
                res.status(500).send();
            });
    } else {
        res.status(401).send();
    }
});

app.put('/claimed/:id', middleware.requireAuthentication, function (req, res) {
    var body = _.pick(req.body, 'user', 'reward', 'status'),
        claimed_id = parseInt(req.params.id, 10),
        attributes = {};

    if (req.user.get('type') !== 10) {
        if (body.hasOwnProperty('user')) {
            attributes.userId = body.user;
        }

        if (body.hasOwnProperty('reward')) {
            attributes.rewardId = body.reward;
        }

        if (body.hasOwnProperty('status')) {
            attributes.statusId = body.status;
        }

        db.claimed
            .findOne({
                where: {id: claimed_id}
            })
            .then(function (claimed) {
                if (claimed) {
                    claimed
                        .update(attributes)
                        .then(function (claimed) {
                            res.json(claimed.toJSON());
                        }, function (e) {
                            res.status(400).json(e);
                        });
                } else {
                    res.status(404).send();
                }
            })
            .catch(function (e) {
                res.status(500).send();
            });
    } else {
        res.status(401).send();
    }
});


/*
 END CLAIMED
 */



/*
 NOTIFICATIONS
 */
app.post('/notifications', middleware.requireAuthentication, function (req, res) {
    var body = _.pick(req.body, 'userId', 'taskId');

    if (req.user.get('type') !== 10) {
        db.notification
            .create(body)
            .then(function (notification) {
                res.status(200).json(notification.toJSON());
            })
            .catch(function (e) {
                res.status(500).json(e);
            });
    } else {
        res.status(401).send();
    }
});

app.get('/notifications', middleware.requireAuthentication, function (req, res) {

    db.notification
        .findAll({where: {userId: req.user.get('userId')}})
        .then(function (notification) {
            res.status(200).json(notification);
        })
        .catch(function (e) {
            res.status(500).json(e);
        });
});

app.get('/notification/:id', middleware.requireAuthentication, function (req, res) {
    var notificationId = parseInt(req.params.id, 10);

    db.notification
        .findOne({
            where: {id: notificationId, userId: req.user.get('userId')}
        }).then(function (notification) {
            if (notification) {
                res.status(200).json(notification.toJSON());
            } else {
                res.status(404).send();
            }
        })
        .catch(function (e) {
            res.status(500).send();
        });
});

app.delete('/notifications/:id', middleware.requireAuthentication, function (req, res) {
    var notificationId = parseInt(req.params.id, 10);

    if (req.user.get('type') !== 10) {
        db.notification
            .destroy({
                where: {id: notificationId, userId: req.user.get('userId')}
            }).then(function (deleted) {
            if (deleted === 0) {
                res.status(404).json({"error": "No notification found with that id."});
            } else {
                res.status(204).send();
            }
        }, function (e) {
            res.status(500).send();
        });
    } else {
        res.status(401).send();
    }
});

/*
 END NOTIFICATIONS
 */


db.sql
    .sync()
    .then(function () {
            app.listen(PORT, function () {
                console.log('Express server listening on port ' + PORT);
            });
        }
    );