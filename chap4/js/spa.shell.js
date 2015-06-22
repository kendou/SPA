/*
 * spa.shell.js
 * Shell module for SPA
*/

/*jslint	browser : true, continue : true
	devel : true, indent : 2, maxerr : 50,
	newcap : true, nomen : true, plusplus : true,
	regexp : true, sloppy : true, vars : false,
	white : true
*/
/*global $, spa */

spa.shell = (function () {
	//-------------------BEGIN MODULE SCOPE VARIABLES ---------------
	var configMap = {
			anchor_schema_map : {
				chat : {opened:true, closed:true}
			},
			main_html : String()
				+'<div id="spa">\
				<div class="spa-shell-head">\
					<div class="spa-shell-head-logo"></div>\
					<div class="spa-shell-head-acct"></div>\
					<div class="spa-shell-head-search"></div>\
				</div>\
				<div class="spa-shell-main">\
					<div class="spa-shell-main-nav"></div>\
					<div class="spa-shell-main-content"></div>\
				</div>\
				<div class="spa-shell-foot"></div>\
				<div class="spa-shell-modal"></div>\
			</div>',
			resize_interval : 200
		},
		stateMap = { 
			$container : undefined,
			anchor_map : {},
			resize_idto : undefined
		},
		jqueryMap = {},
		copyAnchorMap, setJqueryMap, changeAnchorPart, 
		onHashchange, onResize, setChatAnchor, initModule;
	//------------------END MODULE SCOPE VARIABLES ------------------
	
	//------------------BEGIN UTILITY VARIABLES ----------------
	//Returns copy of stored anchor map; minimizes overhead
	copyAnchorMap = function (){
		return $.extend(true, {}, stateMap.anchor_map);
	};
	//------------------END UTILITY VARIABLES ------------------
	
	//------------------BEGIN DOM METHODS ----------------------
	setJqueryMap = function (){
		var $container = stateMap.$container;
		jqueryMap = {$container : $container};
	}
	// End DOM method /setJqueryMap/

	//Begin DOM method /changeAnchorPart/
	//Purpose : Changes part of the URI anchor component
	changeAnchorPart = function (arg_map){
		var anchor_map_revise = copyAnchorMap(),
		bool_return = true,
		key_name, key_name_dep;
		
		//Begin merge changes into anchor map
		KEYVAL:
		for(key_name in arg_map){
			if(arg_map.hasOwnProperty(key_name)){
				//skip dependent keys during iteration
				if(key_name.indexOf('_') === 0) {continue KEYVAL;}
				
				//update independent key value
				anchor_map_revise[key_name] = arg_map[key_name];
				
				//update matching dependent key
				key_name_dep = '_' + key_name;
				if(arg_map[key_name_dep]){
					anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
				}
				else {
					delete anchor_map_revise[key_name_dep];
					delete anchor_map_revise['_s' + key_name_dep];
				}
			}
		}
		//End merge changes into anchor map
		
		//Begin attempt to update URI; revert if not successful
		try{
			$.uriAnchor.setAnchor(anchor_map_revise);
		}
		catch (error){
			//replace URI with existing state
			$.uriAnchor.setAnchor(stateMap.anchor_map, null, true);
			bool_return = false;
		}
		//End attempt to update URI...
		
		return bool_return;
	};
	//End DOM method /changeAnchorPart/
	//------------------END DOM METHODS ------------------------
	
	//------------------BEGIN EVENT HANDLERS -------------------
	//Begin Event handler /onHashchange/
	//Purpose: Handles the hashchange event
	//Arguments:
	//    * event - jQuery event object.
	//Settings : none
	//Returns : false;
	onHashchange = function (event){
		var
			anchor_map_previous = copyAnchorMap(),
			anchor_map_proposed,
			_s_chat_previous, _s_chat_proposed,
			s_chat_proposed, is_ok = true;
			
			//attempt to parse anchor
			try {
				anchor_map_proposed = $.uriAnchor.makeAnchorMap();}
			catch(error){
				$uriAnchor.setAnchor(anchor_map_previous, null, true);
				return false;
			}
			stateMap.anchor_map = anchor_map_proposed;
			
			//convenience vars
			_s_chat_previous = anchor_map_previous._s_chat;
			_s_chat_proposed = anchor_map_proposed._s_chat;
			
			//Begin adjust chat component if changed
			if(!anchor_map_previous || _s_chat_previous !== _s_chat_proposed){
				s_chat_proposed = anchor_map_proposed.chat;
				switch(s_chat_proposed){
					case 'opened':
						is_ok = spa.chat.setSliderPosition('opened');
						break;
					case 'closed':
						is_ok = spa.chat.setSliderPosition('closed');
						break;
					default:
						spa.chat.setSliderPosition('closed');
						delete anchor_map_proposed.chat;
						$.uriAnchor.setAnchor(anchor_map_proposed,null,true);
				}
			}
			//End adjust chat component if changed
			
			//Begin revert anchor if slider change denied
			if(!is_ok){
				if(anchor_map_previous){
					$.uriAnchor.setAnchor(anchor_map_previous, null, true);
					stateMap.anchor_map = anchor_map_previous;
				}
				else {
					delete anchor_map_proposed.chat;
					$.uriAnchor.setAnchor(anchor_map_proposed, null, true);
				}
			}			
			return false;
	};
	//End event handler /onHashchange/
	
	//Begin Event handler /onResize/
	onResize = function (){
		if(stateMap.resize_idto){return true;}
		
		spa.chat.handleResize();
		stateMap.resize_idto = setTimeout(
			function(){stateMap.resize_idto = undefined;},
			configMap.resize_interval
		);
	};
	//End event handler /onResize/
	
	//-------------------END EVENT HANDLERS --------------------

	//-------------------BEGIN Callbacks------------------------
	setChatAnchor = function (position_type){
		return changeAnchorPart({chat:position_type});
	};
	//End callback method /setChatAnchor/
	//-------------------END CALLBACKS--------------------------
	
	//------------------BEGIN PUBLIC METHODS -------------------
	//Begin Public method /initModule/
	initModule = function ($container) {
		//load HTML and map jQuery collections
		stateMap.$container = $container;
		$container.html(configMap.main_html);
		setJqueryMap();
		
		//configure uriAnchor to use our schema
		$.uriAnchor.configModule({
			schema_map : configMap.anchor_shcema_map
		});		
		
		//configure and initialize feature modules
		spa.chat.configModule( {
			set_chat_anchor : setChatAnchor,
			chat_model : spa.model.chat,
			people_model : spa.model.people
		} );
		spa.chat.initModule(jqueryMap.$container);
		
		//Handle URI anchor change events.
		$(window)
			.bind('resize', onResize)
			.bind('hashchange', onHashchange)
			.trigger('hashchange');
	};
	//End Public method /initModule/
	
	return { initModule : initModule };
	//-------------------END PUBLIC METHODS---------------------
} ());