var express = require('express'),
http = require('http'),
bodyParser = require('body-parser'),
config = require("./config"),
partials = require('express-partials');

var connectAssets = require('connect-assets');

var application = express();

application.engine('html', require('ejs').renderFile);
application.set('view engine', 'html');
application.set('views', __dirname + '/../client/Views/');
application.use(partials());
application.use(bodyParser.json());
application.use(bodyParser.urlencoded({
    extended: true
}));
application.use(express.static(__dirname + '/../client/'));

application.get('/',
function(req, res, next) {
    config.routes.VantageSearch.index({},
    req, res, next)
});
for (var i in config.routes) {
    (function(i) {
        var route = config.routes[i];
        for (var item in route) {
            if (route.get && route.get.indexOf(item) > -1) {
                application.route(["", i, item].join('/')).get((function(item) {
                    return function(req, res, next) {
                        route[item](req.query, req, res, next);
                    }
                } (item)));
            } else if (route.post && route.post.indexOf(item) > -1) {
                application.route(["", i, item].join('/')).post((function(item) {
                    return function(req, res, next) {
                        route[item](req.body, req, res, next);
                        console.log(item);
                    }
                } (item)));
            } else {
                application.route(["", i, item].join('/')).all((function(item) {
                    return function(req, res, next) {
                        var model = req.query || {};
                        for (var p in req.body) {
                            model[p] = req.body[p];
                        }
                        route[item](model, req, res, next);
                    }
                } (item)));
            }
        }
    })(i);
}

var mongoose = require('mongoose');
mongoose.connect(config.db);
application.on('close',
function(errno) {
    mongoose.disconnect(function(err) {});
});

http.createServer(application).listen(config.port,
function() {
    console.log("Express server listening on port " + config.port);
});
module.exports = application;