this.song = [];
function WebViewAssistant(songInfo) {
	this.song = songInfo;
}

WebViewAssistant.prototype.setup = function() {
	this.controller.enableFullScreenMode(true);
	this.controller.setupWidget("amazonWeb",
  	this.attributes = {
      url: 'http://www.amazon.com/s/url=search-alias%3Ddigital-music&field-keywords=' + this.song[0].artist + " " + this.song[0].song + "&tag=fiowarecom-20",
      minFontSize: 18,
  	},
  	this.model = {
  	}
	); 
};

WebViewAssistant.prototype.activate = function(event) {

};

WebViewAssistant.prototype.deactivate = function(event) {

};

WebViewAssistant.prototype.cleanup = function(event) {

};
