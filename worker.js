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
	passport = require('passport'),
	flash = require('connect-flash');
var app;
var configDB = require('./config/database');
function setup(app, models){
	mongoose.connect(configDB.url);
	mongooseCache(mongoose, {
		cache: true,
		ttl: 60,
		store: 'memory',
		prefix: 'cache'
	});
	app.engine('html', swig.renderFile);
	app.set('view engine', 'html');
	app.set('view cache', false);
	app.set('views', __dirname + '/src/views');
	swig.setDefaults({cache: false});
	app.use(lessMiddleware(path.join(__dirname, '/src/less'), {
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
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(flash());

	if(nconf.get('site:use_csrf')){
		app.use(csrf());
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
	app.locals.siteName = nconf.get('server:site_name');
	// Helpers
	app.locals.slug = require('slug');
	app.locals.moment = require('moment');
	app.locals.now = function(){
		return new Date();
	};

	setupRoutes(models, function(){
	});
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