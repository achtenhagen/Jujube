this.playlists = [];
this.songs = [];
this.listItems = [];
function SelectPlaylistAssistant(songsToAdd) {
	this.songs = songsToAdd;
}

SelectPlaylistAssistant.prototype.setup = function() {
	this.controller.enableFullScreenMode(true);
		this.controller.setupWidget("playList",
         {
            itemTemplate:"playlists/entry", 
            swipeToDelete:false, 
			autoconfirmDelete: false,
            renderLimit: 100,
            reorderable:false
        },  this.model = {items: this.listItems});
	Mojo.Event.listen(this.controller.get('playList'), Mojo.Event.listTap, this.tapped.bind(this));
	Mojo.Event.listen(this.controller.get('footer'), Mojo.Event.tap, this.resetScroll.bind(this));
	this.songDb = new Mojo.Depot({name: "ext:jujubeDb"});
	this.songDb.get("songs", this.dbSuccess.bind(this), this.dbFailure.bind(this));	
};

SelectPlaylistAssistant.prototype.showDialogBox = function(title,message,index){
	try {
	this.controller.showAlertDialog({
		onChoose: function(value) {
		if(value == 'add'){
			this.totalSongs = [];
			for(i=0;i<this.playlists[index].playlist[0].songs.length;i++)
			{
				this.totalSongs[i] = {
					song: this.playlists[index].playlist[0].songs[i].song,
					artist: this.playlists[index].playlist[0].songs[i].artist,
					icon: this.playlists[index].playlist[0].songs[i].icon,
					released: this.playlists[index].playlist[0].songs[i].released,
					id: this.playlists[index].playlist[0].songs[i].id
				}
			}
		var newSongCount = this.totalSongs.length;
		for(i=0;i<this.songs.length;i++)
			{
				this.totalSongs[newSongCount + i] = {
					song: this.songs[i].song,
					artist: this.songs[i].artist,
					released: this.songs[i].released,
					icon: this.songs[i].icon,
					id: this.songs[i].id
				}
			}
		this.playlists[index].playlist[0] = {
				name:this.playlists[index].playlist[0].name,
				songs: this.totalSongs
			}
		}
		else
		{
			this.playlists[index].playlist[0] = {
				name:this.playlists[index].playlist[0].name,
				songs: this.songs
			}	
		}
		 this.songDb = new Mojo.Depot({name: "ext:jujubeDb"});
		 this.songDb.add("songs", this.playlists);
		 this.controller.stageController.popScene('select-playlist');
	},
		allowHTMLMessage: true,
		title: title,
		message:message,
		choices:[ {label:'Add', value:'add', type:'color'}, {label:'Replace', value:'overwrite', type:'color'}]
	});
	} catch (e) {
}
};

SelectPlaylistAssistant.prototype.resetScroll = function(event){
	this.controller.get('playList').mojo.revealItem(0,true);
};

SelectPlaylistAssistant.prototype.dbSuccess = function(database){
	this.playlists = [];
	this.playlists = database;
	if(database == null || this.playlists.length == 0 || this.playlists == null)
		this.showDialogBox("Error","There are currently no available Playlists.");
	else
	{
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
		} catch (e) {
			this.showDialog("Error","Unable to load your Playlists.");
		}		
	}
};
SelectPlaylistAssistant.prototype.dbFailure = function(transaction, result) {};

SelectPlaylistAssistant.prototype.tapped = function(event){
	var i = event.index;
	var name = event.item.name;
	this.showDialogBox("Save These Songs As...","How would you like to add these songs to the " + name + " Playlist?",i);
};

SelectPlaylistAssistant.prototype.activate = function(event) {

};

SelectPlaylistAssistant.prototype.deactivate = function(event) {

};

SelectPlaylistAssistant.prototype.cleanup = function(event) {

};