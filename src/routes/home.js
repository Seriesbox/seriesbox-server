module.exports = function home(app, api){
	app.get('/', function(req, res){
		if(req.isAuthenticated()){
			res.render('home/index', {
				user: req.user
			});
		}else{
			res.redirect('/auth/login');
		}
	});
};