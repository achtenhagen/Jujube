var displayCount = 30;
var blockLimit = 0;
this.id = 0;
this.songs = [];
this.playList = [];
this.playlists = [];
this.data = [];
var myTag = "";
function ArtistSongsAssistant(artistId) {
	this.id = artistId; 
}

var AddPlayListAssistant = Class.create({
	initialize: function(sceneAssistant,songs) {
		this.sceneAssistant = sceneAssistant;
		this.controller = sceneAssistant.controller;
		this.data = [];
		this.data = songs;
	},
	setup : function(widget) {
		this.controller.setupWidget("playListName",
 		this.attributes = {
      		hintText: $L("Name of the new Playlist..."),
      		multiline: false,
      		enterSubmits: true,
      		focus: true
  		},
 		 this.model = {
      		value: '',
      		disabled: false
  		}
	); 
		this.widget = widget;
		this.controller.get('createPlayListBtn').addEventListener(Mojo.Event.tap, this.handleCreatePlayList.bindAsEventListener(this));
		this.controller.get('cancelPlayListBtn').addEventListener(Mojo.Event.tap, this.handleCancelPlayList.bindAsEventListener(this));
	},
	
	handleCreatePlayList: function() {
		if(this.controller.get('playListName').mojo.getValue().length > 0)
		{
			this.songDb = new Mojo.Depot({name: "ext:jujubeDb"});
			this.songDb.get("songs", this.dbSuccess.bind(this), this.dbFailure.bind(this));
		}
	},
	
	handleCancelPlayList: function() {
		this.widget.mojo.close();
	},
	
	dbSuccess: function(database){
	try {
		var index = 0;
		this.playList = [];
		this.playList = database;
		if(this.playList == null)
			index = 0;
		else
			index = this.playList.length;
		this.newPlayListSongs = [];
		//loop through all the songs and add them to newPlayListSongs
		for(i=0;i<this.data.length;i++)
		{
			this.newPlayListSongs[i] = {
			song: this.data[i].song,
			artist: this.data[i].artist,
			released: this.data[i].released,
			icon: this.data[i].icon,
			id: this.data[i].id
			}
		}
		//instantiate new playlist and store the name of it and the array of songs
		this.newPlayList = [];
		this.newPlayList[0] = {
				name: this.controller.get('playListName').mojo.getValue(),
				songs: this.newPlayListSongs
			}
		//Save the new playlist to the existing playlist array
		if(this.playList == null)
			this.playList = [];
		this.playList[index] = {
				playlist: this.newPlayList
			}
		//Store all playlists in the database
	    this.songDb = new Mojo.Depot({name: "ext:jujubeDb"});
		this.songDb.add("songs", this.playList);
	} catch (e) {
			this.showDialogBox("Error",e.message);
	}
		this.widget.mojo.close();
	},
	
	showDialogBox: function(title,message){
		this.controller.showAlertDialog({
		onChoose: function(value) {},
		title:title,
		message:message,
		choices:[ {label:'OK', value:'OK', type:'color'} ]
	});
	},
	
	dbFailure: function(){
		
	},
});

ArtistSongsAssistant.prototype.close =  function(e){};
ArtistSongsAssistant.prototype.open =  function(e){this.scrim.show();};

ArtistSongsAssistant.prototype.setup = function() {
		this.controller.enableFullScreenMode(true);
		this.exampleSpinner = 'example-activity-spinner',
		this.spinnerAttrs = {
		spinnerSize: Mojo.Widget.spinnerLarge,
		property: 'spinning1'
		}	
		this.spinnerModel = {
			spinning1: true
		};
		this.exampleSpinner = 'large-activity-spinner';	
		this.controller.setupWidget('large-activity-spinner', this.spinnerAttrs, this.spinnerModel);
		this.scrim = Mojo.View.createScrim(this.controller.document, {onMouseDown:this.close.bind(this), scrimClass:'palm-scrim'});
		this.controller.get("scrim").appendChild(this.scrim).appendChild($(this.exampleSpinner));
		this.songs = [];
		this.controller.setupWidget("songList",
         {
            itemTemplate:"search/entry", 
            swipeToDelete:true, 
			autoconfirmDelete: true,
            renderLimit: 100,
			addItemLabel: 'Load more songs...',
            reorderable:false
        },  this.songsModel = {items: this.songs});
		this.attributes = {
           menuClass: 'no-fade'
        }
		this.attributes = {
           menuClass: 'no-fade'
        },
		this.controller.setupWidget(Mojo.Menu.commandMenu, this.attributes, {
		items: [{},{},{label: $L("Options"), command: 'options'}]
		});
		this.options = [];
		this.options[0] = {name: 'Refresh Data...'};
		this.options[1] = {name: 'Save This Playlist...'};
			this.controller.setupWidget("optionsList",{
    		itemTemplate:"search/options", 
     		swipeToDelete:false, 
			autoconfirmDelete: false,
       		renderLimit: 10,
        	reorderable:false
        	},  
		this.optionsModel = {items: this.options});	
		this.controller.setupWidget("options",
  		this.attributes = {
      	modelProperty: 'open',
      	unstyled: false
  		},
  		this.model = {
      	open: false
  		}
		); 
		var request = new Ajax.Request("http://fioware.com/jujube/artist.php?id=" + this.id, {
        method: "get",
        evalJSON: "false",
        onSuccess: this.searchSuccess.bind(this),
        onFailure: this.searchFailure.bind(this)});
		Mojo.Event.listen(this.controller.get('songList'), Mojo.Event.listDelete, this.itemRemoved.bind(this));
		Mojo.Event.listen(this.controller.get('songList'), Mojo.Event.listTap, this.tapped.bind(this));
		Mojo.Event.listen(this.controller.get('optionsList'), Mojo.Event.listTap, this.optionTapped.bind(this));
		Mojo.Event.listen(this.controller.get('songList'), Mojo.Event.listAdd, this.loadMoreItems.bind(this));
		Mojo.Event.listen(this.controller.get('footer'), Mojo.Event.tap, this.resetScroll.bind(this));
};

ArtistSongsAssistant.prototype.loadMoreItems = function(event){
	blockLimit++;
	this.setupdata();
};

ArtistSongsAssistant.prototype.searchSuccess = function(transport){
	this.songs = [];
	this.songs = transport.responseText.evalJSON();
	this.setupdata();
};

ArtistSongsAssistant.prototype.searchFailure = function(result){};

ArtistSongsAssistant.prototype.setupdata = function() {
	this.newSongs = [];
	for(i=0;i<this.songs.songs.length;i++)
	{
		this.newSongs[i] = {
			id: this.songs.songs[i].id,
			song: this.songs.songs[i].title,
			artist: this.songs.name,
			released: this.songs.songs[i].released,
			artwork: this.songs.songs[i].artwork
		}
		if(i%2 == 0)
			this.newSongs[i].color = '#CBE88D';
		else
			this.newSongs[i].color = '#DAEAB9';
		if(this.songs.songs[i].artwork == "" || this.songs.songs[i].artwork == null || this.songs.songs[i].artwork.length == 0 || this.songs.songs[i].artwork == " ")
			this.newSongs[i].icon = 'images/album.png'
		else
			this.newSongs[i].icon = this.songs.songs[i].artwork;
	}	
	this.songsModel.items = this.newSongs;
	this.controller.modelChanged(this.songsModel);
	this.controller.get('headLine').update('Found ' + this.newSongs.length + " possible matches...");
	this.scrim.hide();
};

ArtistSongsAssistant.prototype.itemRemoved = function(event){
	this.newSongs.splice(event.index, 1)
	this.controller.get('headLine').update('Found ' + this.newSongs.length + " possible matches...");
};

ArtistSongsAssistant.prototype.optionTapped = function(event){
	if(event.index == 0)
	{
		this.controller.get('options').mojo.toggleState();
		this.scrim.show();
		var request = new Ajax.Request("http://fioware.com/jujube/artist.php?id=" + this.id, {
        method: "get",
        evalJSON: "false",
        onSuccess: this.searchSuccess.bind(this),
        onFailure: this.searchFailure.bind(this)});
	}
	else
	{
		this.controller.get('options').mojo.toggleState();
		if(this.newSongs.length > 0)
		{	
		this.controller.showAlertDialog({
		onChoose: function(value){
		if(value == 'existing')	
		{
			Mojo.Controller.stageController.pushScene({'name': 'select-playlist', sceneTemplate: 'select-playlist/select-playlist-scene',transition: Mojo.Transition.crossFade}, this.newSongs);
		
		}		
	else if(value == 'new')
		{
			this.controller.showDialog({
			template: 'search/add-playlist',
			assistant: new AddPlayListAssistant(this,this.newSongs,this.playList)
		});		
		}								
		},
		title:'Save This Playlist As...',
		message:'How would you like to save this playlist?',
		choices:[{label: 'Create New Playlist', value:'new', type:'default'}, {label:'Choose Existing...', value:'existing', type:'default'}]
		});	
		}
	}
};

ArtistSongsAssistant.prototype.close =  function(e){};
ArtistSongsAssistant.prototype.open =  function(e){this.scrim.show();};

ArtistSongsAssistant.prototype.handleCommand = function(event){
	this.controller = Mojo.Controller.stageController.activeScene();
	if (event.type == Mojo.Event.command) {
		switch (event.command) {
			case 'options':
				this.controller.get('options').mojo.toggleState();		
			break;
		}
	}
};

ArtistSongsAssistant.prototype.resetScroll = function(event){
	if(this.model.open == false)
		this.controller.get('songList').mojo.revealItem(0,true);
};

ArtistSongsAssistant.prototype.activate = function(event) {
	
};

ArtistSongsAssistant.prototype.deactivate = function(event) {
	blockLimit = 0;
};

ArtistSongsAssistant.prototype.cleanup = function(event) {

};

ArtistSongsAssistant.prototype.tapped = function(event) {
	this.songId = event.item.id;
	this.song = [];
	this.song[0] = {
			song: this.newSongs[event.index].song,
			artist: this.newSongs[event.index].artist,
			released: this.newSongs[event.index].released,
			icon: this.newSongs[event.index].icon,	
			id: this.newSongs[event.index].id	
	}	
	this.controller.showAlertDialog({
		onChoose: function(value){ 
			if (value == 'add') {
				Mojo.Controller.stageController.pushScene({'name': 'select-playlist', sceneTemplate: 'select-playlist/select-playlist-scene',transition: Mojo.Transition.crossFade}, this.song);
			}	
			else if (value == 'amazon') {
				Mojo.Controller.stageController.pushScene({'name': 'web-view', sceneTemplate: 'web-view/web-view-scene',transition: Mojo.Transition.crossFade}, this.song);
			}	
			if (value == 'tag') {
				this.controller.showDialog({
					template: 'search/add-tag',
					assistant: new AddTagAssistant(this, this.songId)
				});
			}
			if(value == 'similar')
				Mojo.Controller.stageController.pushScene({'name': 'similar-songs', sceneTemplate: 'similar-songs/similar-songs-scene',transition: Mojo.Transition.crossFade}, this.song);
		},
		title:'Song Info For...',
		allowHTMLMessage: true,
		message:"<table><tr><td><img src=" + event.item.icon + " class='albumDialog'></img></td><td valign='top'><div style='font-size:18px;color:#4D544D;width:220px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;-moz-binding:url(ellipsis.xml#ellipsis);'>" + event.item.song + "</div><div style='margin-top:8px;'></div><div style='font-size:18px;color:#4D544D;width:220px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;-moz-binding:url(ellipsis.xml#ellipsis);'>" + event.item.artist + "</div><div style='margin-top:8px;'></div><div style='font-size:18px;color:#4D544D;'>" + event.item.released + "</div></span></tr></table>",
		choices:[{label: 'Buy on Amazon MP3', value:'amazon', type:'affirmative'}, {label: 'Find similar songs...', value:'similar', type:'default'}, {label: 'Tag this song', value:'tag', type:'default'}, {label: 'Add to Playlist', value:'add', type:'default'}]
		});	
};

ArtistSongsAssistant.prototype.showDialogBox = function(title,message){
	this.controller.showAlertDialog({
		onChoose: function(value) {},
		title:title,
		message:message,
		choices:[ {label:'OK', value:'OK', type:'color'} ]
	});
};

var AddTagAssistant = Class.create({
	initialize: function(sceneAssistant,idParam) {
		this.sceneAssistant = sceneAssistant;
		this.controller = sceneAssistant.controller;
		this.id = idParam;
	},
	setup : function(widget) {
		this.controller.setupWidget("tagName",
 		this.attributes = {
      		hintText: $L("What would you tag this song with?"),
      		multiline: false,
      		enterSubmits: true,
      		focus: true
  		},
 		 this.model = {
      		value: '',
      		disabled: false
  		}
	); 
		this.widget = widget;
		this.controller.get('createTagBtn').addEventListener(Mojo.Event.tap, this.handleCreateTag.bindAsEventListener(this));
		this.controller.get('cancelTagBtn').addEventListener(Mojo.Event.tap, this.handleCancelTag.bindAsEventListener(this));
	},
	
	ajaxTag: function(tag){
	myTag = tag;
	this.cookie = new Mojo.Model.Cookie('jujube_user')
	var cookieSettings = this.cookie.get();
	this.user = [];
	this.user = {location: cookieSettings.location};
	if(this.user.location == true)
	{
		 this.controller.serviceRequest('palm://com.palm.location', {
			method : 'getCurrentPosition',
	        parameters: {
				responseTime: 2,
	            subscribe: false
	                },
	        onSuccess: this.handleServiceResponse.bind(this),
	        onFailure: this.handleServiceResponseError.bind(this)
	    });	
	}
	else
	{
		var request = new Ajax.Request("http://fioware.com/jujube/add_tag.php?id=" + this.id + "&tag=" + myTag, {
        method: "get",
        evalJSON: "false",
        onSuccess: this.TagSuccess.bind(this),
        onFailure: this.TagFailure.bind(this)});
	}
	
	},
	
	handleServiceResponse: function(event){
	  latitude = event.latitude;
	  longitude = event.longitude;
	  if (typeof latitude !== "undefined" && typeof longitude !== "undefined") {
			var request = new Ajax.Request("http://fioware.com/jujube/add_tag.php?id=" + this.id + "&tag=" + myTag + "&latitude=" + latitude + "&longitude=" + longitude, {
        	method: "get",
        	evalJSON: "false",
        	onSuccess: this.TagSuccess.bind(this),
        	onFailure: this.TagFailure.bind(this)});
	  } 
	  else
	  {
	  	var request = new Ajax.Request("http://fioware.com/jujube/add_tag.php?id=" + this.id + "&tag=" + myTag, {
        method: "get",
        evalJSON: "false",
        onSuccess: this.TagSuccess.bind(this),
        onFailure: this.TagFailure.bind(this)});
	  }
	},

	handleServiceResponseError: function(event) {
	var request = new Ajax.Request("http://fioware.com/jujube/add_tag.php?id=" + this.id + "&tag=" + myTag, {
        method: "get",
        evalJSON: "false",
        onSuccess: this.TagSuccess.bind(this),
        onFailure: this.TagFailure.bind(this)});
	},

	TagSuccess: function(event){
		this.widget.mojo.close();
	},

	TagFailure: function(event){
		this.widget.mojo.close();
	},
	
	handleCreateTag: function() {
		if(this.controller.get('tagName').mojo.getValue().length > 0)
		{
			var tagText = this.controller.get('tagName').mojo.getValue();
			this.ajaxTag(tagText);
		}
	},
	
	handleCancelTag: function() {
		this.widget.mojo.close();
	},
	
	showDialogBox: function(title,message){
		this.controller.showAlertDialog({
		onChoose: function(value) {},
		title:title,
		message:message,
		choices:[ {label:'OK', value:'OK', type:'color'} ]
	});
	},
	
});
