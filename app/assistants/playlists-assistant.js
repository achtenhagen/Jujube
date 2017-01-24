this.playlists = [];
this.listItems = [];
function PlaylistsAssistant() {

}

PlaylistsAssistant.prototype.setup = function() {
		this.controller.enableFullScreenMode(true);
		this.listItems = [];
		this.controller.setupWidget("playList",
         {
            itemTemplate:"playlists/entry", 
            swipeToDelete:true, 
			autoconfirmDelete:false,
            renderLimit: 100,
            reorderable:false
        },  this.model = {items: this.listItems});
		this.controller.get('headLine').update("0 Playlists");
		this.songDb = new Mojo.Depot({name: "ext:jujubeDb"});
		this.songDb.get("songs", this.dbSuccess.bind(this), this.dbFailure.bind(this));
		Mojo.Event.listen(this.controller.get('playList'), Mojo.Event.listDelete, this.deleted.bind(this));
		Mojo.Event.listen(this.controller.get('playList'), Mojo.Event.listTap, this.tapped.bind(this));
		Mojo.Event.listen(this.controller.get('footer'), Mojo.Event.tap, this.resetScroll.bind(this));
};

PlaylistsAssistant.prototype.resetScroll = function(event){
	this.controller.get('playList').mojo.revealItem(0,true);
};

PlaylistsAssistant.prototype.deleted = function(event){
	for (i = 0; i < this.listItems.length; i++) {
		if (this.listItems[i].name == event.item.name) {
			try {
					this.playlists.splice(i, 1)
				} 
					catch (e) {}
				}
			}
	 this.controller.get('headLine').update(this.playlists.length + " Playlists");
	 this.songDb = new Mojo.Depot({name: "ext:jujubeDb"});
	 this.songDb.add("songs", this.playlists);
};

PlaylistsAssistant.prototype.tapped = function(event){
	Mojo.Controller.stageController.pushScene({'name': 'playlist-songs', sceneTemplate: 'playlist-songs/playlist-songs-scene',transition: Mojo.Transition.crossFade},this.playlists[event.index].playlist[0].songs,event.index);
};

PlaylistsAssistant.prototype.dbSuccess = function(database){
	this.playlists = [];
	this.playlists = database;
	try {
			this.listItems = [];
	for(i=0;i<this.playlists.length;i++)
		{
			this.listItems[i] = {
				name: this.playlists[i].playlist[0].name
			} 
			if(i%2 == 0)
				this.listItems[i].color = '#CBE88D';
			else
				this.listItems[i].color = '#DAEAB9';
		}
		this.model.items = this.listItems;
		this.controller.modelChanged(this.model);
		this.controller.get('headLine').update(this.listItems.length + " Playlists");
	} catch (e) {
	}
};

PlaylistsAssistant.prototype.showDialogBox = function(title,message){
	this.controller.showAlertDialog({
		onChoose: function(value) {},
		title:title,
		message:message,
		choices:[ {label:'OK', value:'OK', type:'color'} ]
	});
}

PlaylistsAssistant.prototype.dbFailure = function(result){
	this.showDialogBox("Error",result);
};

PlaylistsAssistant.prototype.activate = function(event) {

};

PlaylistsAssistant.prototype.deactivate = function(event) {

};

PlaylistsAssistant.prototype.cleanup = function(event) {

};
