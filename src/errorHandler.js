function renderError(err, req, res, next){
	if(!err){
		return next();
	}
	if(err.status){
		res.status(err.status);
	}else{
		res.status(500);
	}
	res.render('error.html', {
        status: err.status,
        code: err.code,
		message: err.message
	});
}
module.exports = renderError;