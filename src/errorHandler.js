function renderError(req, res, next, errorMessage){
	res.render('error.html', {
		errorMessage: errorMessage
	});
}
module.exports = function(err, req, res, next){
	console.log(err.message)
	if(err && err.message){
		switch(err.message){
			case 'EBADCSRFTOKEN':
				res.status(403);
				return renderError(req, res, next, 'Session has expired or form has been tampered with.');
			break;
		}
	}

	res.status(500);
	renderError(req, res, next, 'Unknown error. ' + err.toString());
};