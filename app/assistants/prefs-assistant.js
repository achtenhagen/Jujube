var reset = false;
function PrefsAssistant() {

}

PrefsAssistant.prototype.setup = function() {
	this.controller.enableFullScreenMode(true);
	this.cookie = new Mojo.Model.Cookie('jujube_user')
	var cookieSettings = this.cookie.get();
	this.user = [];
	this.user = {
			name: cookieSettings.name,
			age: cookieSettings.age,
			location: cookieSettings.location,
			exclude: cookieSettings.exclude
		}
	this.controller.get('user').update(this.user.name);
	this.tattr = {
 			trueLabel:  'On',
 			falseLabel:  'Off',
  		}
	this.tModel = {
			value:  this.user.location,   
 			disabled: false 
			
		}
	this.tattr2 = {
 			trueLabel:  'On',
 			falseLabel:  'Off',
  		}
	this.tModel2 = {
			value:  this.user.exclude,   
 			disabled: false 
			
		}
	this.controller.setupWidget('location-toggle', this.tattr,this.tModel);
	this.controller.setupWidget('exclude-toggle', this.tattr2,this.tModel2);
	Mojo.Event.listen(this.controller.get('location-toggle'),Mojo.Event.propertyChange,this.togglePressed.bind(this));
	Mojo.Event.listen(this.controller.get('exclude-toggle'),Mojo.Event.propertyChange,this.togglePressed2.bind(this));
	Mojo.Event.listen(this.controller.get('resetBtn'), Mojo.Event.tap, this.showResetBox.bind(this));
	Mojo.Event.listen(this.controller.get('cancelBtn'),Mojo.Event.tap,this.cancel.bind(this));
};

PrefsAssistant.prototype.togglePressed = function(event){
	this.user.location = event.value;
};

PrefsAssistant.prototype.togglePressed2 = function(event){
	this.user.exclude = event.value;
};

PrefsAssistant.prototype.cancel = function(event){
	this.controller.stageController.popScene('prefs');
};

PrefsAssistant.prototype.activate = function(event) {

};

PrefsAssistant.prototype.deactivate = function(event) {
	if(reset == false)
	{
		this.cookie = new Mojo.Model.Cookie('jujube_user')
		this.cookie.put({
			name: this.user.name,
			age: this.user.age,
			location: this.user.location,
			exclude: this.user.exclude
		})
	}
	
};

PrefsAssistant.prototype.cleanup = function(event) {

};

PrefsAssistant.prototype.showResetBox = function(){
	this.controller.showAlertDialog({
		onChoose: function(value) {if(value == 'yes'){
	{
		this.cookie = new Mojo.Model.Cookie('jujube_user')
		this.cookie.remove();
		reset = true;
	}			
	}},
		allowHTMLMessage: true,
		title:'Reset your profile?',
		message:'This action cannot be undone.<br />Your playlists will not be affected.',
		choices:[{label: 'Reset', value:'yes', type:'negative'}, {label:'Cancel', value:'no', type:'affirmative'}]
	});	
};