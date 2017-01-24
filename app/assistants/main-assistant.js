this.user = [];
this.playList = [];
this.listItems = [];
this.currentSongId = -1;
var lastItem = -1;
var amazonUrl = "";
function MainAssistant() {

}

var UserDialogAssistant = Class.create({
	
	initialize: function(sceneAssistant) {
		this.sceneAssistant = sceneAssistant;
		this.controller = sceneAssistant.controller;
	},
	
	setup : function(widget) {
		this.controller.setupWidget("userName",
 		this.attributes = {
      		hintText: $L("What's your first name?"),
      		multiline: false,
      		enterSubmits: false,
      		focus: true
  		},
 		 this.model = {
      		value: '',
      		disabled: false
  		}
	); 
	
		this.controller.setupWidget("agePicker",
  		this.ageAttributes = {
      		label: 'How old are you?',
      		modelProperty: 'value',
      		min: 1,
      		max: 100
  	},
  		this.ageModel = {
      		value: 0
  	}
); 
		this.widget = widget;
		this.controller.get('createProfileBtn').addEventListener(Mojo.Event.tap, this.handleCreateProfile.bindAsEventListener(this));
	},
	
	handleCreateProfile: function() {
	this.cookie = new Mojo.Model.Cookie('jujube_user')
	this.cookie.put({
			name: this.controller.get('userName').mojo.getValue(),
			age: this.ageModel.value,
			location: false
		})
	this.user = {
			name: this.controller.get('userName').mojo.getValue(),
			age: this.ageModel.value,
			location: false
		}
		this.widget.mojo.close();	
	}
});

MainAssistant.prototype.setup = function(){
	this.controller.enableFullScreenMode(true);
	try {
		this.cookie = new Mojo.Model.Cookie('jujube_user')
		var cookieSettings = this.cookie.get();
		this.user = [];
		this.user = {
			name: cookieSettings.name,
			age: cookieSettings.age,
			location: cookieSettings.location
		}
	} 
	catch (e) {
		this.controller.showDialog({
			template: 'main/user-dialog',
			assistant: new UserDialogAssistant(this)
		});
	}
	this.controller.setupWidget("suggestedSong",
  	this.attributes = {
      modelProperty: 'open',
      unstyled: false
  	},
  	this.model = {
      open: false
  	}
	); 
	Mojo.Event.listen(this.controller.get('footer'), Mojo.Event.tap, this.toggleDrawer.bind(this));
	Mojo.Event.listen(this.controller.get('search'), Mojo.Event.tap, this.search.bind(this));
	Mojo.Event.listen(this.controller.get('suggestNoBtn'), Mojo.Event.tap, this.suggestNo.bind(this));
	Mojo.Event.listen(this.controller.get('suggestYesBtn'), Mojo.Event.tap, this.suggestYes.bind(this));
	Mojo.Event.listen(this.controller.get('settings'), Mojo.Event.tap, this.launchPrefs.bind(this));
	Mojo.Event.listen(this.controller.get('addSong'), Mojo.Event.tap, this.addSong.bind(this));
	Mojo.Event.listen(this.controller.get('aboutBtn'), Mojo.Event.tap, this.about.bind(this));
	Mojo.Event.listen(this.controller.get('location'), Mojo.Event.tap, this.getLocation.bind(this));
	Mojo.Event.listen(this.controller.get('playlist'), Mojo.Event.tap, this.launchPlaylist.bind(this));
	Mojo.Event.listen(this.controller.get('buyBtn'), Mojo.Event.tap, this.buySong.bind(this));
};

MainAssistant.prototype.buySong = function(event){
	if(amazonUrl != "")
	{
		 this.controller.serviceRequest('palm://com.palm.applicationManager', {
    			 method: 'open',
   				 parameters: {
      			 id: 'com.palm.app.browser',
      			params: {
        		target: amazonUrl
      			}
    		}
  		});
	}	
};

MainAssistant.prototype.getLocation = function(event){
	 this.controller.serviceRequest('palm://com.palm.location', {
			method : 'getCurrentPosition',
	        parameters: {
				responseTime: 2,
	            subscribe: false
	                },
	        onSuccess: this.handleServiceResponse.bind(this),
	        onFailure: this.handleServiceResponseError.bind(this)
	    });	
};

MainAssistant.prototype.handleServiceResponse = function(event) {
	  latitude = event.latitude;
	  longitude = event.longitude;
	  if (typeof latitude !== "undefined" && typeof longitude !== "undefined") {
		this.controller.serviceRequest('palm://com.palm.applicationManager', {
		    method: 'launch',
		    parameters: {
		        id:"com.palm.app.maps",
		        params:{"query":"ll="+latitude+","+longitude}
		    }
		});
	} 
};

MainAssistant.prototype.handleServiceResponseError = function(event) {
	this.showDialogBox("Error","Unable to get your current location.")
};

MainAssistant.prototype.about = function(event){
	this.controller.showAlertDialog({
		onChoose: function(value){
			if (value == 'legal') {
				 this.controller.serviceRequest('palm://com.palm.applicationManager', {
    			 method: 'open',
   				 parameters: {
      			 id: 'com.palm.app.browser',
      			params: {
        		target: 'http://fioware.com/eula.txt'
      			}
    		}
  		});
			}
		},
		allowHTMLMessage: true,
		title:'About Jujube - ' + Mojo.appInfo.version,
		message: "<table width='100%' border='0'><tr><td valign='top' style='text-align:center;'><img src='icon.png'></img></td><td valign='top'><span style='text-align:left;color:#4485F3;'>Released: June 2011" + "<br><a style='text-decoration:none;color:#4485F3;' href='http://fioware.com/'>http://fioware.com</a><br><a style='text-decoration:none;color:#4485F3;' href='mailto:maurice@fioware.com'>maurice@fioware.com</a></span></td></tr></table>",
		choices:[
		{
			label: 'View License',
			value: 'legal',
			type: 'default'
		},
		{
			label: 'Close',
			value: 'close',
			type: 'default'
		}]
	});	
};

MainAssistant.prototype.suggestYes = function(event){
	var request = new Ajax.Request("http://fioware.com/jujube/increment.php?id=" + this.currentSongId, {
        method: "get",
        evalJSON: "false",
        onSuccess: this.checkYesSuccess.bind(this),
        onFailure: this.checkYesFailure.bind(this)});
};

MainAssistant.prototype.suggestNo = function(event){
	var request = new Ajax.Request("http://fioware.com/jujube/increment.php?decrement=&id=" + this.currentSongId, {
        method: "get",
        evalJSON: "false",
        onSuccess: this.checkNoSuccess.bind(this),
        onFailure: this.checkNoFailure.bind(this)});
};

MainAssistant.prototype.checkNoSuccess = function(event){
	this.songDb = new Mojo.Depot({name: "ext:jujubeDb"});
	this.songDb.get("songs", this.dbSuccess.bind(this), this.dbFailure.bind(this));
};

MainAssistant.prototype.checkNoFailure = function(event){};

MainAssistant.prototype.checkYesSuccess = function(event){
	this.songDb = new Mojo.Depot({name: "ext:jujubeDb"});
	this.songDb.get("songs", this.dbSuccess.bind(this), this.dbFailure.bind(this));
};

MainAssistant.prototype.checkYesFailure = function(event){};

MainAssistant.prototype.addSong = function(event){
	Mojo.Controller.stageController.pushScene({'name': 'add-song', sceneTemplate: 'add-song/add-song-scene',transition: Mojo.Transition.crossFade});
};

MainAssistant.prototype.launchPlaylist = function(event){
	Mojo.Controller.stageController.pushScene({'name': 'playlists', sceneTemplate: 'playlists/playlists-scene',transition: Mojo.Transition.crossFade});
};

MainAssistant.prototype.showDialogBox = function(title,message){
	this.controller.showAlertDialog({
		onChoose: function(value) {},
		title:title,
		message:message,
		choices:[ {label:'Close', value:'OK', type:'color'} ]
	});
};

MainAssistant.prototype.launchPrefs = function(event){
	Mojo.Controller.stageController.pushScene({'name': 'prefs', sceneTemplate: 'prefs/prefs-scene',transition: Mojo.Transition.crossFade});
};

MainAssistant.prototype.search = function(event){
	this.cookie = new Mojo.Model.Cookie('jujube_user')
		var cookieSettings = this.cookie.get();
		this.user = [];
		this.user = {
			name: cookieSettings.name,
			age: cookieSettings.age,
			location: cookieSettings.location
		}
	var age = this.user.age;
	this.controller.showAlertDialog({
		onChoose: function(value){ 
			if (value == 'child') {
				var d = new Date();
				var year = d.getFullYear();
			if(age <= 18)
			{
				age -= 5;
				timeRangeA = parseInt(year - age);
				timeRangeB = timeRangeA + 4 
			}	
			else
			{
				age -= 12;
				timeRangeA = parseInt(year - age);
				timeRangeB = timeRangeA + 6;
			}
		Mojo.Controller.stageController.pushScene({'name': 'search',sceneTemplate: 'search/search-scene',transition: Mojo.Transition.crossFade}, timeRangeA, timeRangeB, 30);
		}	
			else if (value == 'period') {
			this.controller.popupSubmenu({
     		 onChoose: this.popupHandler,
     		 placeNear: event.target,items:[
	 		{label: $L('1950-1960'), command:'4'},
	  		{label: $L('1960-1970'), command:'5'},
	  		{label: $L('1970-1980'), command:'6'},
	  		{label: $L('1980-1990'), command:'7'},
	  		{label: $L('1990-2000'), command:'8'},
	  		{label: $L('2000-2010'), command:'9'}]}); 	
			}	
			else if(value == 'artist')
			{
				Mojo.Controller.stageController.pushScene({'name': 'artist-search',sceneTemplate: 'artist-search/artist-search-scene',transition: Mojo.Transition.crossFade});
			}
			else if(value == 'other')
			{
				this.controller.showDialog({
				template: 'tag-search/search-dialog',
				assistant: new TagDialogAssistant(this)});
			}
		},
		title:'Search Preferences',
		allowHTMLMessage: true,
		message:"<span style='font-size:17px;'>Please select your preferred method of searching for music below:</span>",
		choices:[{label: 'Find Childhood Songs', value:'child', type:'default'},
		{label: 'Find My Song', value:'other', type:'default'},
		{label: 'Specify Time Period', value:'period', type:'default'},
		{label: 'Search By Artist', value:'artist', type:'default'}]
		});	
};

MainAssistant.prototype.popupHandler = function(command){	
		switch (command) {
			case '4':
				timeRangeA = 1950
				timeRangeB = 1960
				Mojo.Controller.stageController.pushScene({'name': 'search',sceneTemplate: 'search/search-scene',transition: Mojo.Transition.crossFade}, timeRangeA, timeRangeB, 30);
			break;	
			case '5':
				timeRangeA = 1960
				timeRangeB = 1970
				Mojo.Controller.stageController.pushScene({'name': 'search',sceneTemplate: 'search/search-scene',transition: Mojo.Transition.crossFade}, timeRangeA, timeRangeB, 30);
			break;	
			case '6':
				timeRangeA = 1970
				timeRangeB = 1980
				Mojo.Controller.stageController.pushScene({'name': 'search',sceneTemplate: 'search/search-scene',transition: Mojo.Transition.crossFade}, timeRangeA, timeRangeB, 30);
			break;	
			case '7':
				timeRangeA = 1980
				timeRangeB = 1990
				Mojo.Controller.stageController.pushScene({'name': 'search',sceneTemplate: 'search/search-scene',transition: Mojo.Transition.crossFade}, timeRangeA, timeRangeB, 30);
			break;	
			case '8':
				timeRangeA = 1990
				timeRangeB = 2000
				Mojo.Controller.stageController.pushScene({'name': 'search',sceneTemplate: 'search/search-scene',transition: Mojo.Transition.crossFade}, timeRangeA, timeRangeB, 30);
			break;	
			case '9':
				timeRangeA = 2000
				timeRangeB = 2010
				Mojo.Controller.stageController.pushScene({'name': 'search',sceneTemplate: 'search/search-scene',transition: Mojo.Transition.crossFade}, timeRangeA, timeRangeB, 30);
			break;	
		}
};

MainAssistant.prototype.toggleDrawer = function(){
	if(this.listItems.length > 0)
		this.controller.get('suggestedSong').mojo.toggleState();
};

MainAssistant.prototype.activate = function(event) {
	this.songDb = new Mojo.Depot({name: "ext:jujubeDb"});
	this.songDb.get("songs", this.dbSuccess.bind(this), this.dbFailure.bind(this));
};

MainAssistant.prototype.dbFailure = function(event){};

MainAssistant.prototype.randomFromTo = function (from, to){	
       return Math.floor(Math.random() * (to - from + 1) + from);
};
MainAssistant.prototype.dbSuccess = function(database){
	this.playlists = [];
	this.playlists = database;
	try {
			this.listItems = [];
	for(i=0;i<this.playlists.length;i++)
		{
			this.listItems[i] = {
				name: this.playlists[i].playlist[0].name,
				songs: this.playlists[i].playlist[0].songs
			} 
		}
	if(this.listItems.length > 0)
	{
		var randomList = this.randomFromTo(0,this.listItems.length-1);
		var randomSong = this.randomFromTo(0,this.listItems[randomList].songs.length-1);
		if (randomSong == lastItem) {
			while(randomSong == lastItem)
		{
			randomSong = this.randomFromTo(0,this.listItems[randomList].songs.length-1);
		}
		}
		if(randomSong != lastItem)
		{
			lastItem = randomSong;
			var randomId = this.listItems[randomList].songs[randomSong].id;
			var request = new Ajax.Request("http://fioware.com/jujube/find.php?id=" + randomId + "&random", {
        	method: "get",
        	evalJSON: "false",
        	onSuccess: this.checkSuccess.bind(this),
        	onFailure: this.checkFailure.bind(this)});
		}
	}
	} catch (e) {
	}
};

MainAssistant.prototype.checkSuccess = function(event){
	this.randomSong = [];
	this.randomSong = event.responseText.evalJSON();
	this.currentSongId = this.randomSong.id;
	this.controller.get('randomTitle').update(this.randomSong.title);
	this.controller.get('randomArtist').update(this.randomSong.artist);
	this.controller.get('randomYear').update(this.randomSong.released);
	amazonUrl = 'http://www.amazon.com/s/url=search-alias%3Ddigital-music&field-keywords=' + this.randomSong.artist + "%20" + this.randomSong.title + "/?tag=fiowarecom-20";
		if(this.randomSong.artwork == "" || this.randomSong.artwork == null || this.randomSong.artwork.length == 0 || this.randomSong.artwork == " ")
			document.getElementById('randomCover').src = 'images/album.png'
		else
			document.getElementById('randomCover').src = this.randomSong.artwork;
	
};

MainAssistant.prototype.checkFailure = function(event){};

MainAssistant.prototype.deactivate = function(event) {

};

MainAssistant.prototype.cleanup = function(event) {
	
};

var TagDialogAssistant = Class.create({
	initialize: function(sceneAssistant) {
		this.sceneAssistant = sceneAssistant;
		this.controller = sceneAssistant.controller;
	},
	
	setup : function(widget) {
		this.widget = widget;
		this.controller.setupWidget("tagName",
 		this.attributes = {
      		hintText: $L("What do you link your song with?"),
      		multiline: false,
      		enterSubmits: true,
      		focus: true,
  		},
 		 this.model = {
      		value: '',
      		disabled: false
  		}
	); 
		this.controller.get('searchBtn').addEventListener(Mojo.Event.tap, this.handleSearch.bind(this));
	},

	showDialogBox: function(title,message){
		this.controller.showAlertDialog({
		onChoose: function(value) {},
		title:title,
		message:message,
		choices:[{label:'OK', value:'OK', type:'color'}]
	});
	},
	
	handleSearch: function() {
		this.tag = this.controller.get('tagName').mojo.getValue();
		Mojo.Controller.stageController.pushScene({'name': 'tag-search', sceneTemplate: 'tag-search/tag-search-scene',transition: Mojo.Transition.crossFade}, this.tag);
	},
});
