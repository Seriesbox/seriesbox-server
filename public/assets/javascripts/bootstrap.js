(function(global){
	var ID = global.ID;
	var textarea = document.createElement('textarea');
	if(document.selection && document.selection.createRange){
		var insertAtCaret = function(value){
			this.focus();
			sel = document.selection.createRange();
			sel.text = value;
			this.focus();
		};
	}else if(textarea.selectionStart || textarea.selectionStart == '0'){
		 var insertAtCaret = function(value){
			var startPos = this.selectionStart;
			var endPos = this.selectionEnd;
			var scrollTop = this.scrollTop;

			this.value = [
				this.value.substring(0, startPos),
				value,
				this.value.substring(endPos, this.value.length)
			].join('');
			this.focus();
			this.selectionStart = startPos + value.length;
			this.selectionEnd = startPos + value.length;
			this.scrollTop = scrollTop;
		};
	}
	if(insertAtCaret){
		ID.insertAtCaret = function(el, value){
			insertAtCaret.call(el, value);
		};
	}
	global.ID = ID;
})(window);
(function(global){
	var Site = {};
	Site.queue = []; 
	Site.isDev = window.location.hostname == '127.0.0.1';
	Site.init = function(){
		/* 
			General initalization function,
			the rest should be added to the queue.
		*/
		window.scrollTo(0, 1);
	};
	Site.addToQueue = function(script){
		var queue = Site.queue;
		if(ID && ID.isHostMethod && ID.isHostMethod(queue, 'push')){
			if(queue.indexOf(script) == -1){
				queue.push(script);
			}
		}
	};
	if(ID && ID.areFeatures && ID.areFeatures('attachListener', 'forEach')){
		ID.attachListener(window, 'load', function ready(){
			Site.init();
			ID.forEach(Site.queue, function(script){
				if(typeof script == 'function'){
					script();
				}
			});
		});
	}
	global.Site = Site;
})(window);