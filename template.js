;(function(RCS){
	var getTemplates = function(callback){
		var list = {
	        button: 'templates/button.html',
	        chat: 'templates/chat.html',
	        // conversation: 'templates/conversation.html',
	        imageView: 'templates/imageView.html',
	        imMain: 'templates/imMain.html',
	        imMessage: 'templates/imMessage.html',
	        imMessageTemplate: 'templates/imMessageTemplate.html'
	    };
	    var templates = {};
	    for (var key in list) {
	    	var url = list[key];
	    	var html = RCS.templateCache[url];
	    	if (html) {
	    		templates[key] = html;
	    	} else {
		    	var xhr = new XMLHttpRequest();
		    	xhr.open('get', url, false);
		    	xhr.onreadystatechange = function(){
		    		if (xhr.readyState == 4 && xhr.status == 200) {
		    			templates[key] = xhr.responseText;
		    		}
		    	}
		    	xhr.send(null);
	    	}

	    }
	    return templates;
	}
	RCS.getTemplates = getTemplates;
})(RCS);