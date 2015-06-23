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
/*global $, spa, getComputedStyle */

spa.chat = (function (){
	//Begin module scope variables
	var configMap = {
		main_html : '<div class="spa-chat">\
				<div class="spa-chat-head">\
					<div class="spa-chat-head-toggle"></div>\
					<div class="spa-chat-head-title">\
						"Chat"\
					</div>\
				</div>\
				<div class="spa-chat-closer">X</div>\
				<div class="spa-chat-sizer">\
					<div class="spa-chat-msgs"></div>\
					<div class="spa-chat-box">\
						<input type="text"/>\
						<div>send</div>\
					</div>\
				</div>\
			</div>',
		settable_map : {
			slider_open_time : true,
			slider_close_time : true,
			slider_opened_em : true,
			slider_closed_em : true,
			slider_opened_title : true,
			slider_closed_title : true,
			
			chat_model : true,
			people_model : true,
			set_chat_anchor : true
		},
		
		slider_open_time : 250,
		slider_close_time : 250,
		slider_opened_em : 18,
		slider_closed_em : 2,
		slider_opened_min_em : 10,
		window_height_min_em : 20,
		slider_opened_title : 'Click to close',
		slider_closed_title : 'Click to open',
		
		chat_model : null,
		people_model : null,
		set_chat_anchor : null
	},
	stateMap = {
		$append_target : null,
		position_type : 'closed',
		px_per_em : 0,
		slider_hidden_px : 0,
		slider_closed_px : 0,
		slider_opened_px : 0
	},
	jqueryMap = {},
	setJqueryMap, getEmSize, setPxSizes, setSliderPosition,
	onClickToggle, configModule, initModule,
	removeSlider, handleResize;
	//End module scope variables
	
	//Begin Utility methods
	getEmSize = function (elem) {
		return Number(
			getComputedStyle(elem, ' ').fontSize.match(/\d*\.?\d*/)[0]
		);
	};
	//End utility methods
	
	//Begin DOM methods
	//Begin DOM method /setJqueryMap/
	setJqueryMap = function (){
		var 
			$append_target = stateMap.$append_target,
			$slider = $append_target.find('.spa-chat');
			
		jqueryMap = {
			$slider : $slider,
			$head : $slider.find('.spa-chat-head'),
			$toggle : $slider.find('.spa-chat-head-toggle'),
			$title : $slider.find('.spa-chat-head-title'),
			$sizer : $slider.find('.spa-chat-sizer'),
			$msgs : $slider.find('.spa-chat-msgs'),
			$box : $slider.find('.spa-chat-box'),
			$input : $slider.find('.spa-chat-input input[type=text]') };
	};
	//End DOM method /setJqueryMap/
	
	//Begin DOM method /setPxSizes/
	setPxSizes = function (){
		var px_per_em, window_height_em, opened_height_em;
		
		px_per_em = getEmSize (jqueryMap.$slider.get(0) );
		window_height_em = Math.floor(
			($(window).height()/px_per_em) + 0.5
		);
		opened_height_em = window_height_em > configMap.window_height_min_em
						? configMap.slider_opened_em
						: configMap.slider_opened_min_em;
								
		stateMap.px_per_em = px_per_em;
		stateMap.slider_closed_px = configMap.slider_closed_em * px_per_em;
		stateMap.slider_opened_px = opened_height_em * px_per_em;
		jqueryMap.$sizer.css({
			height : (opened_height_em -2) * px_per_em
		});
	};
	//End DOM method /setPxSizes/
	
	//Begin public method /setSliderPosition/
	setSliderPosition = function (position_type, callback) {
		var height_px, animate_time, slider_title, toggle_text;
		
		//return true if slider already in requested position
		if(stateMap.position_type === position_type){
			return true;
		}
		
		//prepare animate parameters
		switch (position_type){
			case 'opened':
				height_px = stateMap.slider_opened_px;
				animate_time = configMap.slider_open_time;
				slider_title = configMap.slider_opened_title;
				toggle_text = '=';
			break;
			case 'hidden':
				height_px = 0;
				animate_time = configMap.slider_open_time;
				slider_title = '';
				toggle_text = '+';
			break;
			case 'closed':
				height_px = stateMap.slider_closed_px;
				animate_time = configMap.slider_close_time;
				slider_title = configMap.slider_closed_title;
				toggle_text = '+';
			break;
			//bail for unknown position_type
			default: return false;
		}
		
		//animate slider position change
		stateMap.position_type = '';
		jqueryMap.$slider.animate(
			{height : height_px},
			animate_time,
			function (){
				jqueryMap.$toggle.prop('title',slider_title);
				jqueryMap.$toggle.text(toggle_text);
				stateMap.position_type = position_type;
				if(callback) {callback(jqueryMap.$slider);}
			}
		);
		
		return true;
	};
	//End public method /setSliderPosition/
	//End DOM methods
	
	//Begin Event handlers
	onClickToggle = function(event) {
		var set_chat_anchor = configMap.set_chat_anchor;
		if(stateMap.position_type === 'opened'){
			set_chat_anchor('closed');
		}
		else if(stateMap.position_type === 'closed'){
			set_chat_anchor('opened');
		}
		return false;
	};
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
	};
	//End public method /configModule/
	
	//Begin public method /initModule/
	initModule = function ($append_target ){
		$append_target.append(configMap.main_html);
		stateMap.$append_target = $append_target;
		setJqueryMap();
		setPxSizes();
		
		//initizlie chat slider to default title and state
		jqueryMap.$toggle.prop('title', configMap.slider_closed_title);
		jqueryMap.$head.click(onClickToggle);
		stateMap.position_type = 'closed';
		
		return true;
	};
	//End public method /initModule/
	
	//Begin public method /removeSlider/
	removeSlider = function (){
		//unwind initialization and state
		//remove DOM container; this remove event bindings too
		if(jqueryMap.$slider){
			jqueryMap.$slider.remove();
			jqueryMap = {};
		}
		
		stateMap.$append_target = null;
		stateMap.position_type = 'closed';
		
		//unwind key configurations
		configMap.chat_model = null;
		configMap.people_model = null;
		configMap.set_chat_anchor = null;
		
		return true;
	};
	//End public method /removeSlider/
	
	//Begin public method /handleResize/
	handleResize = function(){
		//don't do anything if we don't have a slider container
		if(!jqueryMap.$slider) {return false;}
		
		setPxSizes();
		if(stateMap.position_type === 'opened'){
			jqueryMap.$slider.css({height:stateMap.slider_opened_px});
		}
		return true;
	};
	
	//return public methods
	return {
		setSliderPosition : setSliderPosition,
		configModule : configModule,
		initModule : initModule,
		removeSlider : removeSlider,
		handleResize : handleResize
	};
	
	//End public methods
}());
