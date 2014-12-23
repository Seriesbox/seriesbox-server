(function(global){
	var Site = global.Site || {};
	Site.Login = {};
	Site.Login.init = function(){
		var self = this;
	};
	if(Site.addToQueue){
		Site.addToQueue(function ThreadInit(){
			Site.Login.init();
		});
	}
	global.Site = Site;
})(window);