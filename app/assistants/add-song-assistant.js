function AddSongAssistant() {

}

AddSongAssistant.prototype.setup = function() {
	this.controller.enableFullScreenMode(true);
	this.controller.get("headLine").update("Add a song to our database...");
		this.controller.setupWidget("songName",
 		this.attributes = {
      		multiline: false,
      		enterSubmits: false,
      		focus: true
  		},
 		 this.model = {
      		value: '',
      		disabled: false
  		}
	); 
			this.controller.setupWidget("artistName",
 		this.attributes = {
      		multiline: false,
      		enterSubmits: false,
      		focus: false
  		},
 		 this.model = {
      		value: '',
      		disabled: false
  		}
	); 
			this.controller.setupWidget("yearReleased",
 		this.attributes = {
      		multiline: false,
      		enterSubmits: false,
      		focus: false
  		},
 		 this.model = {
      		value: '',
      		disabled: false
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
		Mojo.Event.listen(this.controller.get('submitBtn'), Mojo.Event.tap, this.handleSubmit.bind(this));
};

AddSongAssistant.prototype.close =  function(e){};
AddSongAssistant.prototype.open =  function(e){this.scrim.show();};

AddSongAssistant.prototype.handleSubmit = function(event){
	if(this.controller.get('songName').mojo.getValue().length > 0 && this.controller.get('artistName').mojo.getValue().length > 0 && this.controller.get('yearReleased').mojo.getValue().length > 0)
	{
		this.scrim.show();
		var url = "http://fioware.com/jujube/add_song.php?title=" + this.controller.get('songName').mojo.getValue() + "&artist=" + this.controller.get('artistName').mojo.getValue() + "&released=" + this.controller.get('yearReleased').mojo.getValue();
		var request = new Ajax.Request(url, {
        method: "get",
        evalJSON: "false",
        onSuccess: this.checkSuccess.bind(this),
        onFailure: this.checkFailure.bind(this)});
	}
	else
		this.controller.get('headLine').update('Not enough information!');
};

AddSongAssistant.prototype.checkSuccess = function(event){
	this.controller.get('headLine').update('Thanks for submitting your song!');
	this.controller.stageController.popScene();
};

AddSongAssistant.prototype.checkFailure = function(event){
	this.controller.get('headLine').update('An error occured. Try again later!');
};

AddSongAssistant.prototype.activate = function(event) {

};

AddSongAssistant.prototype.deactivate = function(event) {
	
};

AddSongAssistant.prototype.cleanup = function(event) {

};
