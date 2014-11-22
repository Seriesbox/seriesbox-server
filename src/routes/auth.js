module.exports = function auth(app, models){
	var Account = models.Account;
	app.get('/auth', function(req, res, next){
		next(new res.NotAcceptable('Invalid URL'));
	});

	app.get('/auth/login', function(req, res){
		res.render('auth/login');
	});

	app.post('/auth/login', passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/auth/login',
		failureFlash: true
	}));

    app.get('/auth/logout', function(req, res){
        req.logout();
        res.redirect('/');
    });
};