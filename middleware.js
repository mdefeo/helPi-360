var cryptojs = require('crypto-js'),
    date_format = require('dateformat');

module.exports = function (db) {
    return {
        requireAuthentication: function (req, res, next) {
            var token = req.get('Auth') || '',
                now = new Date();

            db.token
                .findOne({
                    where: {
                        tokenHash: cryptojs.MD5(token).toString()
                    }
                })
                .then(function (token_instance) {
                    var test = cryptojs.MD5(token).toString();
                    if (!token_instance) {
                        throw new Error();
                    }

                    // Check if token is expired and remove from DB if so
                    if (token_instance.get('expiration') <= now) {
                        return token_instance
                            .destroy()
                            .then(function () {
                                throw new Error();
                            });
                    } else {
                        // Extend session expiration by 30 minutes
                        expiration_date = date_format(now.setMinutes(now.getMinutes() + 30), 'isoDateTime');

                        req.token = token_instance;

                        return token_instance
                            .update({
                                expiration: expiration_date
                            })
                            .then(function(){
                                return db.user
                                    .findByToken(token);
                            });
                    }
                })
                .then(function (user) {
                    req.user = user;
                    next();
                })
                .catch(function (e) {
                    res.status(401).send();
                });
        }
    };
};