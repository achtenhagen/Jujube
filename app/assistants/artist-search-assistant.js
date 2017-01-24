function ArtistSearchAssistant() {

}
this.artists = [];
var UserDialogAssistant = Class.create({
	initialize: function(sceneAssistant) {
		this.sceneAssistant = sceneAssistant;
		this.controller = sceneAssistant.controller;
	},
	
	setup : function(widget) {
		this.controller.setupWidget("artistName",
 		this.attributes = {
      		hintText: $L("Type artist name here..."),
      		multiline: false,
      		enterSubmits: true,
      		focus: true,
  		},
 		 this.model = {
      		value: '',
      		disabled: false
  		}
	); 
		this.artists = [];
		this.controller.setupWidget("artistList",
         {
            itemTemplate:"artist-search/entry", 
            swipeToDelete:false, 
			autoconfirmDelete: true,
            renderLimit: 100,
            reorderable:false
        },  this.artistModel = {items: this.artists});
		this.widget = widget;
		this.controller.get('searchBtn').addEventListener(Mojo.Event.tap, this.handleSearch.bind(this));
		this.controller.get('artistList').addEventListener(Mojo.Event.listTap, this.tapped.bind(this));
	},
	
	tapped: function(event){
		var id = event.item.id;
		Mojo.Controller.stageController.pushScene({'name': 'artist-songs', sceneTemplate: 'artist-songs/artist-songs-scene',transition: Mojo.Transition.crossFade}, id);
		
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
	if(this.controller.get('artistName').mojo.getValue().length > 0)
		{
			try {
				this.widget.mojo.close();
				var request = new Ajax.Request("http://fioware.com/jujube/artist_search.php?artist=" + this.controller.get('artistName').mojo.getValue(), {
        		method: "get",
        		evalJSON: "false",
        		onSuccess: this.searchSuccess.bind(this),
        		onFailure: this.searchFailure.bind(this)});
				} catch (e) {}	
		}
	},
		
	searchSuccess: function(transport){
		this.artists = [];
		this.temp = transport.responseText.evalJSON();
		for(i=0;i<this.temp.length;i++)
		{
			this.artists[i] = {
				id: this.temp[i].id,
				name: this.temp[i].name
			}
			if(i%2 == 0)
				this.artists[i].color = '#CBE88D';
			else
				this.artists[i].color = '#DAEAB9';
		}
		this.artistModel.items = this.artists;
		this.controller.modelChanged(this.artistModel);
		this.controller.get('headLine').update('Found ' + this.artists.length + " Artists...");
	},
	
	searchFailure: function(transport){this.widget.mojo.close();}
});

ArtistSearchAssistant.prototype.setup = function() {
	this.controller.enableFullScreenMode(true);
	this.controller.get('headLine').update('Type to search...');
	this.controller.showDialog({
			template: 'artist-search/search-dialog',
			assistant: new UserDialogAssistant(this)
		});	
	Mojo.Event.listen(this.controller.get('footer'), Mojo.Event.tap, this.resetSearch.bind(this));
};

ArtistSearchAssistant.prototype.resetSearch = function(event){
	this.controller.get('songList').mojo.revealItem(0,true);
};

ArtistSearchAssistant.prototype.activate = function(event) {

};

ArtistSearchAssistant.prototype.deactivate = function(event) {

};

ArtistSearchAssistant.prototype.cleanup = function(event) {

};
