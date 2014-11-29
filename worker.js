var express = require('express'),
	bodyParser = require('body-parser'),
 	cookieParser = require('cookie-parser'),
	expressSession = require('express-session'),
	staticFavicon = require('static-favicon'),
	csrf = require('csurf')
	swig = require('swig'),
	path = require('path'),
	fs = require('fs'),
	async = require('async'),
	lessMiddleware = require('less-middleware'),
	mongoose = require('mongoose'),
	mongooseCache = require('mongoose-cache-manager'),
	httpResponses = require('http-responses'),
	passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
	flash = require('flash');
var app;
var models;
var configDB = require('./config/database');
var noop = function(){};
function setup(app){
	mongoose.connect(configDB.url);
	mongooseCache(mongoose, {
		cache: true,
		ttl: 60,
		store: 'memory',
		prefix: 'cache'
	});
	models = require('./src/models');
	var Account = models.Account;

	passport.use(new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password'
	}, Account.authenticate()));

	passport.serializeUser(Account.serializeUser());
	passport.deserializeUser(Account.deserializeUser());

	app.engine('html', swig.renderFile);
	app.set('view engine', 'html');
	app.set('view cache', false);
	app.set('views', __dirname + '/src/views');
	swig.setDefaults({cache: false});
	app.use(lessMiddleware(path.join(__dirname, '/less'), {
			dest: path.join(__dirname, 'public'),
			preprocess: {
				path: function(pathname, req){
				 	return pathname.replace(/\/assets\/stylesheets\//, '/');
				}
			},
			force: true
		}
	));
	app.use(express.static(path.join(__dirname, 'public')));
	app.use(bodyParser.urlencoded({extended: true}));
	app.use(bodyParser.json());
	app.use(cookieParser());
	app.use(expressSession({
		secret: 'secret',
		cookie: {
			httpOnly: true
		},
		resave: true,
		saveUninitialized: true
	}));
	app.use(httpResponses);
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(flash());
	// Fix for flash messages not being removed
	app.use(function(req, res, next){
		if(req.session.flash.length > 0){
			req.session.flash = [];
		}
		next();
	});

	if(nconf.get('site:use_csrf')){
		app.use(csrf());
		app.use(function(err, req, res, next){
 			if(err.code !== 'EBADCSRFTOKEN'){
				return next(err)
			}
			next(new res.Forbidden('Session has expired or form has been tampered with.'));
		})
		app.use(function(req, res, next){
			res.locals.csrftoken = req.csrfToken();

			// Disable framing
			res.setHeader('X-Frame-Options', 'SAMEORIGIN');

			next();
		});
	}
	app.use(function(err, req, res, next){
 		res.setHeader('X-Powered-By', 'Seriesbox');
		next(err);
	});

	// Config
	app.locals.siteName = nconf.get('site:name');
	// Helpers
	app.locals.slug = require('slug');
	app.locals.moment = require('moment');
	app.locals.now = function(){
		return new Date();
	};

	setupRoutes(models, noop);
	app.use(require('./src/errorHandler'));
}

function setupRoutes(models, _callback){
	require('./src/routes')(app, models, _callback);
}

function init(port, siteName){
	if(!app){
		app = express();
	}

	setup(app, siteName);

	app.listen(port, function(){
		console.log('Seriesbox listening at', '0.0.0.0:' + port);
	});
}

module.exports = init;