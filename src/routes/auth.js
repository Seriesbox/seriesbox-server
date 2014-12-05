var emailRegex = require('email-regex');
var makeUser = function(req, res, models, token){
	var Account = models.Account,
		Invite = models.Invite;
	if(req.body.username){
		var username = req.body.username,
			email = req.body.email,
			password = req.body.password;
		var errors = [];
		
		if(username.length == 0){
			req.flash('error', 'Username must contain more than 1 character');
		}

		if(!emailRegex({exact: true}).test(email)){
			req.flash('error', 'No valid email provided');
		}
		
		if(password.length < 5){
			req.flash('error', 'Password must contain more than 5 characters');
		}
		Account.findByUsername(username, function(err, user){
			console.log(err, user)
			var taken = !!user;
			if(taken){
				req.flash('error', 'Username is already registered');
			}
			errors = Object.keys(res.locals.flash);
		
			if(errors.length == 0){
				Account.register(new Account({username: username, email: email}), password, function(err, account) {
					if(token){
						Invite.accept(token, function(err){
							res.redirect('/');
						});
					}else{
						res.redirect('/');
					}
				});
			}else{
				res.render('auth/register', {
					'inviteToken': token
				});
			}
		});
	}else{
		req.flash('error', 'Username does not exist');
		res.render('auth/register', {
			'inviteToken': token
		});
	}
};
module.exports = function auth(app, models){
	var Account = models.Account,
	Invite = models.Invite;
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

	app.all('/auth/register/:inviteToken?', function(req, res){
		var inviteToken = req.body.inviteToken || req.params.inviteToken;
		Invite.valid(inviteToken, function(err, valid){
			if(!err && valid){
				makeUser(req, res, models, inviteToken);
			}else{
				if(inviteToken && inviteToken !== ''){
					req.flash('error', 'Invalid invite provided');
				}else if(req.method == 'POST'){
					req.flash('error', 'No invite provided');
				}
				res.render('auth/register', {
					'inviteToken': inviteToken
				});
			}
		});
	});

	app.get('/utopia', function(req, res){
		Invite.generate(function(err, token){
			res.send(token);
		});
	});

    app.get('/auth/logout', function(req, res){
        req.logout();
        res.redirect('/');
    });
};