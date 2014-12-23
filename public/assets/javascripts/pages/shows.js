(function(global){
	var Site = global.Site || {};
	Site.Shows = {};
	Site.Shows.init = function(){
		var self = this;
	};
	if(Site.addToQueue){
		Site.addToQueue(function ThreadInit(){
			Site.Shows.init();
		});
	}
	global.Site = Site;
})(window);