/*
 * spa.chat.js
 * Chat module for SPA
*/

/*jslint	browser : true, continue : true
	devel : true, indent : 2, maxerr : 50,
	newcap : true, nomen : true, plusplus : true,
	regexp : true, sloppy : true, vars : false,
	white : true
*/
/*global $, spa */

spa.chat = (function (){
	//Begin module scope variables
	var configMap = {
		main_html : String() 
			+ '<div style="padding: 1em; color : #fff;">'
			+ 'Say hello to chat'
			+ '</div>',
		settable_map : {}
	},
	stateMap = {$container : null},
	jqueryMap = {},
	setJqueryMap, configModule, initModule;
	//End module scope variables
	
	//Begin Utility methods
	//End utility methods
	
	//Begin DOM methods
	//Begin DOM method /setJqueryMap/
	setJqueryMap = function (){
		var $container = stateMap.$container;
		jqueryMap = {$container : $container};
	};
	//End DOM methods
	
	//Begin Event handlers
	//End event handlers
	
	//Begin public methods
	//Begin public method /configModule/
	configModule = function (input_map ){
		spa.util.setConfigMap ({
			input_map : input_map,
			settable_map : configMap.settable_map,
			config_map : configMap
			});
		return true;
	}
	//End public method /configModule/
	
	//Begin public method /initModule/
	initModule = function ($container ){
		$container.html(configMap.main_html);
		stateMap.$container = $container;
		setJqueryMap();
		return true;
	};
	//End public method /initModule/
	
	//return public methods
	return {
		configModule : configModule,
		initModule : initModule
	};
	//End public methods
}());
