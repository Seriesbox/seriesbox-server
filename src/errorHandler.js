function renderError(err, req, res, next){
	res.status(err.status);
	res.render('error.html', {
        status: err.status,
        code: err.code,
		message: err.message
	});
}
module.exports = renderError;