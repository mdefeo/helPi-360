app.post('/tasks', middleware.requireAuthentication, function (req, res) {
    var body = _.pick(req.body, 'name', 'points', 'description', 'active');

    db.task
        .create(body)
        .then(function (task) {
            res.status(200).json(task.toJSON());
        })
        .catch(function (e) {
            res.status(500).json(e);
        });
});