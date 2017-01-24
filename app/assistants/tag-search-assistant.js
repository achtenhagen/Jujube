var displayCount = 30;
var blockLimit = 0;
this.songs = [];
this.playList = [];
this.playlists = [];
this.data = [];
this.tag;
function TagSearchAssistant(param){
	this.tag = param;
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

TagSearchAssistant.prototype.setup = function() {
	this.controller.enableFullScreenMode(true);
	this.controller.get('headLine').update('Type to search...');
	this.attributes = {
         menuClass: 'no-fade'
        },	
	this.controller.setupWidget(Mojo.Menu.commandMenu, this.attributes, {
	items: [{},{},{label: $L("Options"), command: 'options'}]});
	this.controller.setupWidget("tagList",
         {
            itemTemplate:"search/entry", 
            swipeToDelete:true, 
			autoconfirmDelete: true,
            renderLimit: 100,
			addItemLabel: 'Load more songs...',
            reorderable:false
        },  this.tagsModel = {items: this.songs});
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
	this.scrim.hide();
	this.setupdata();
	Mojo.Event.listen(this.controller.get('footer'), Mojo.Event.tap, this.resetSearch.bind(this));
	Mojo.Event.listen(this.controller.get('tagList'), Mojo.Event.listTap, this.tapped.bind(this));
	Mojo.Event.listen(this.controller.get('tagList'), Mojo.Event.listDelete, this.itemRemoved.bind(this));
	Mojo.Event.listen(this.controller.get('optionsList'), Mojo.Event.listTap, this.optionTapped.bind(this));
	Mojo.Event.listen(this.controller.get('tagList'), Mojo.Event.listAdd, this.loadMoreItems.bind(this));
	Mojo.Event.listen(this.controller.get('footer'), Mojo.Event.tap, this.resetScroll.bind(this));
};

TagSearchAssistant.prototype.tapped = function(event){
	this.songId = event.item.id;
	this.song = [];
	this.song[0] = {
			song: this.data[event.index].song,
			artist: this.data[event.index].artist,
			released: this.data[event.index].released,
			icon: this.data[event.index].icon,	
			id: this.data[event.index].id	
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

TagSearchAssistant.prototype.optionTapped = function(event){
	if(event.index == 0)
	{
		this.controller.get('options').mojo.toggleState();
		this.setupdata();
	}
	else
	{
		this.controller.get('options').mojo.toggleState();
		if(this.data.length > 0)
		{	
		this.controller.showAlertDialog({
		onChoose: function(value){
		if(value == 'existing')	
		{
			Mojo.Controller.stageController.pushScene({'name': 'select-playlist', sceneTemplate: 'select-playlist/select-playlist-scene',transition: Mojo.Transition.crossFade}, this.data);
		
		}		
	else if(value == 'new')
		{
			this.controller.showDialog({
			template: 'search/add-playlist',
			assistant: new AddPlayListAssistant(this,this.data,this.playList)
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

TagSearchAssistant.prototype.close = function(e){};
TagSearchAssistant.prototype.open =  function(e){this.scrim.show();};
	
TagSearchAssistant.prototype.handleCommand = function(event){
	this.controller = Mojo.Controller.stageController.activeScene();
	if (event.type == Mojo.Event.command) {
		switch (event.command) {
			case 'options':
				this.controller.get('options').mojo.toggleState();	
			break;
		}
	}
};

TagSearchAssistant.prototype.resetSearch = function(event){
	if(this.model.open == false)
		this.controller.get('tagList').mojo.revealItem(0,true);
};

TagSearchAssistant.prototype.setupdata = function(){
		this.scrim.show();
		var request = new Ajax.Request("http://fioware.com/jujube/tag_search.php?tag=" + this.tag, {
        method: "get",
        evalJSON: "false",
        onSuccess: this.searchSuccess.bind(this),
        onFailure: this.searchFailure.bind(this)});
	};
		
TagSearchAssistant.prototype.searchSuccess = function(transport){
		if(transport.responseText == null)
		this.showDialogBox("This song does not yet have any similar songs.","");
	try {
		this.songs = transport.responseText.evalJSON();
		this.data = [];
		for(i=0;i<this.songs.length;i++)
	{
		this.data[i] = {
		'song': this.songs[i].title,
		'artist':this.songs[i].artist,
		'released':this.songs[i].released,
		'popularity':this.songs[i].popularity,
		'amazon': 'http://www.amazon.com/s/url=search-alias%3Ddigital-music&field-keywords=' + this.songs[i].artist + " " + this.songs[i].song + "&tag=fiowarecom-20",
		'tags': this.songs[i].tags,
		'id': this.songs[i].id
		}
		if(i%2 == 0)
			this.data[i].color = '#CBE88D';
		else
			this.data[i].color = '#DAEAB9';
			
		if(this.songs[i].artwork == "" || this.songs[i].artwork == null || this.songs[i].artwork.length == 0 || this.songs[i].artwork == " ")
			this.data[i].icon = 'images/album.png'
		else
			this.data[i].icon = this.songs[i].artwork;
	}
	this.tagsModel.items = this.data;
	this.controller.modelChanged(this.tagsModel);
	this.controller.get('headLine').update('Found ' + this.data.length + " possible matches...");
	this.scrim.hide();
	} catch (e) {
	}
};
	
TagSearchAssistant.prototype.searchFailure = function(transport){
	this.scrim.hide();
	this.widget.mojo.close();
};
	
TagSearchAssistant.prototype.loadMoreItems = function(){
	blockLimit++;
	this.setupdata();
};

TagSearchAssistant.prototype.itemRemoved = function(event){
	this.data.splice(event.index, 1)
	this.controller.get('headLine').update('Found ' + this.data.length + " possible matches...");
};

TagSearchAssistant.prototype.activate = function(event) {

};

TagSearchAssistant.prototype.deactivate = function(event) {
	blockLimit = 0;
};

TagSearchAssistant.prototype.cleanup = function(event) {

};
