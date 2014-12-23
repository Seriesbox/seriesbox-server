(function(global){
	var Site = global.Site || {};
	Site.Home = {};
	Site.Home.init = function(){
		var self = this;
	};
	if(Site.addToQueue){
		Site.addToQueue(function ThreadInit(){
			Site.Home.init();
		});
	}
	global.Site = Site;
})(window);