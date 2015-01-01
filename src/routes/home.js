module.exports = function home(app, models){
	app.get('/', function(req, res){
		if(req.isAuthenticated()){
			res.render('home/index');
		}else{
			res.redirect('/auth/login');
		}
	});
};