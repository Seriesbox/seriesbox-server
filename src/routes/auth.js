module.exports = function auth(app, api){
	app.get('/auth', function(req, res, next){
		next(new Error('xd'));
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