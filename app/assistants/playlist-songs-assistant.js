this.playList = [];
this.songs = [];
var index = 0;
var songToDelete = "";
this.song = [];
var myTag = "";
function PlaylistSongsAssistant(songsParam,i) {
	this.songs = [];
	this.songs = songsParam;
	index = i;
}

PlaylistSongsAssistant.prototype.setup = function() {
	this.controller.enableFullScreenMode(true);
	this.controller.get('headLine').update("0 Songs");
	this.controller.setupWidget("songList",
         {
            itemTemplate:"playlist-songs/entry", 
            swipeToDelete:true, 
			autoconfirmDelete: false,
            renderLimit: 100,
            reorderable:true
        },  this.model = {items: this.songs});
	for(i=0;i<this.songs.length;i++)
	{
		if(i%2 == 0)
			this.songs[i].color = '#CBE88D';
		else
			this.songs[i].color = '#DAEAB9';
			
	}
	this.model.items = this.songs;
	this.controller.modelChanged(this.model);
	this.controller.get('headLine').update(this.songs.length + " Songs");
	Mojo.Event.listen(this.controller.get('footer'), Mojo.Event.tap, this.resetScroll.bind(this));
	Mojo.Event.listen(this.controller.get('songList'), Mojo.Event.listDelete, this.deleted.bind(this));
	Mojo.Event.listen(this.controller.get('songList'), Mojo.Event.listTap, this.tapped.bind(this));
	Mojo.Event.listen(this.controller.get('songList'), Mojo.Event.listReorder, this.moveSong.bind(this));
};

PlaylistSongsAssistant.prototype.moveSong = function(event){
	var fromIndex = event.fromIndex;
    var toIndex = event.toIndex;	
    this.songs.splice(fromIndex, 1);
    this.songs.splice(toIndex, 0, event.item);
	this.songDb = new Mojo.Depot({name: "ext:jujubeDb"});
	this.songDb.get("songs", this.dbSuccess.bind(this), this.dbFailure.bind(this));	
};

PlaylistSongsAssistant.prototype.tapped = function(event){
	this.song = [];
	this.song[0] = {
		song: event.item.song,
		artist: event.item.artist,
		id: event.item.id
	}
	this.controller.showAlertDialog({
		onChoose: function(value){ 
			if (value == 'amazon') {
				Mojo.Controller.stageController.pushScene({'name': 'web-view', sceneTemplate: 'web-view/web-view-scene',transition: Mojo.Transition.crossFade}, this.song);
			}	
			if (value == 'tag') {
				this.controller.showDialog({
					template: 'search/add-tag',
					assistant: new AddTagAssistant(this, this.song[0].id)
				});
			}	
			if(value == 'similar'){
				Mojo.Controller.stageController.pushScene({'name': 'similar-songs', sceneTemplate: 'similar-songs/similar-songs-scene',transition: Mojo.Transition.crossFade}, this.song);
			}
			if(value == 'share'){
				    this.controller.popupSubmenu({
                    onChoose:  this.shareHandler,
                    placeNear: event.target,
                    items: [
                        {label: $L("Email"), command: "do-emailStory"},
                        {label: $L("SMS/IM"), command: "do-messageStory"}
                        ]
                    });
			}					
		},
		title:'Song Info',
		allowHTMLMessage: true,
		message:"<table><tr><td><img src=" + event.item.icon + " class='albumDialog'></img></td><td valign='top'><div style='font-size:18px;color:#4D544D;width:220px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;-moz-binding:url(ellipsis.xml#ellipsis);'>" + event.item.song + "</div><div style='margin-top:8px;'></div><div style='font-size:18px;color:#4D544D;width:220px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;-moz-binding:url(ellipsis.xml#ellipsis);'>" + event.item.artist + "</div><div style='margin-top:8px;'></div><div style='font-size:18px;color:#4D544D;'>" + event.item.released + "</div></span></tr></table>",
		choices:[{label: 'Buy on Amazon MP3', value:'amazon', type:'affirmative'},{label: 'Find similar songs...', value:'similar', type:'default'},{label: 'Share via...', value:'share', type:'default'},{label: 'Tag this Song', value:'tag', type:'default'}]
		});	
};

PlaylistSongsAssistant.prototype.shareHandler = function(command) {    
        switch(command) {
            case "do-emailStory":    
                this.controller.serviceRequest("palm://com.palm.applicationManager", {
                       method: "open",
                       parameters:  {
                           id: "com.palm.app.email",
                           params: {
                            summary: $L("Jujube - Check out this song!"),
                            text: this.song[0].song + " by " + this.song[0].artist + " " + "http://www.amazon.com/s/url=search-alias%3Ddigital-music&field-keywords=" + this.songs[0].artist + " " + this.songs[0].song + "&tag=fiowarecom-20"
                        }
                    }
                });
                break;
            case "do-messageStory":    
                this.controller.serviceRequest("palm://com.palm.applicationManager", {
                       method: "open",
                       parameters: {
                           id: "com.palm.app.messaging",
                           params: {
                               messageText: "Jujube - Check out this song: " + this.song[0].song + " by " + this.song[0].artist + " " + "http://www.amazon.com/s/url=search-alias%3Ddigital-music&field-keywords=" + this.songs[0].artist + " " + this.songs[0].song + "&tag=fiowarecom-20"
                           }
                       }
                });
                break;
       }    
};

PlaylistSongsAssistant.prototype.deleted = function(event){
	songToDelete = event.item.song;
	for (i = 0; i < this.songs.length; i++) {
		if (this.songs[i].song == songToDelete) {
			try {
					this.songs.splice(i, 1)
				} 
					catch (e) {}
				}
			}	
	this.songDb = new Mojo.Depot({name: "ext:jujubeDb"});
	this.songDb.get("songs", this.dbSuccess.bind(this), this.dbFailure.bind(this));
};

PlaylistSongsAssistant.prototype.dbSuccess = function(database){
	this.playList = [];
	this.playList = database;	
	this.playList[index].playlist[0].songs = this.songs;
	this.songDb = new Mojo.Depot({name: "ext:jujubeDb"});
	this.songDb.add("songs",  this.playList);
	this.controller.get('headLine').update(this.songs.length + " Songs");
	
};
PlaylistSongsAssistant.prototype.dbFailure = function(transaction, result) {};

PlaylistSongsAssistant.prototype.resetScroll = function(event){
	this.controller.get('songList').mojo.revealItem(0,true);
};

PlaylistSongsAssistant.prototype.activate = function(event) {

};

PlaylistSongsAssistant.prototype.deactivate = function(event) {

};

PlaylistSongsAssistant.prototype.cleanup = function(event) {

};

PlaylistSongsAssistant.prototype.showDialogBox = function(title,message){
	this.controller.showAlertDialog({
		onChoose: function(value) {},
		title:title,
		message:message,
		choices:[ {label:'OK', value:'OK', type:'color'} ]
	});
}

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
