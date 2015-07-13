/**
 * Created by kenthuang on 15/7/11.
 */
/*jslint    node : true, continue: true,
 devel : true, indent : 2, maxerr : 50,
 newcap : true, nomen : true, plusplus : true,
 regexp : true, sloppy : true, vars : false,
 white : true
 */

/* global */

//-------------------------Begin Module scope variables
'use strict';
var configRoutes,
  mongodb = require('mongodb'),
  mongoServer = new mongodb.Server(
    'localhost',
    27017
  ),
  dbHandle = new mongodb.Db(
    'spa',mongoServer,{w:1}
  ),
  makeMongoId = mongodb.ObjectID;


//-------------------------End Module scope variables

//-------------------------Begin public methods
configRoutes = function(app, server){
  app.get('/', function(request,response){
    response.redirect('/spa.html');
  });

  app.all('/:obj_type/*?', function(request, response, next){
    response.contentType('json');
    next();
  });

  app.get('/:obj_type/list', function(request, response){
    dbHandle.collection(
      request.params.obj_type,
      function(outer_error, collection){
        collection.find().toArray(
          function(inner_error, map_list){
            response.send(map_list);
          }
        );
      }
    );
  });

  app.post('/:obj_type/create', function(request, response){
    dbHandle.collection(
      request.params.obj_type,
      function(outer_error, collection){
        var options_map = {safe:true},
          obj_map = request.body;
        collection.insert(
          obj_map,
          options_map,
          function(inner_error, result_map){
            response.send(result_map);
          }
        );
      }
    );
  });

  app.get('/:obj_type/read/:id([0-9]+)', function(request, response){
    var find_map = {_id: makeMongoId(request.params.id)};
    dbHndle.collection(
      request.params.obj_type,
      function(outer_error, collection){
        collection.findOne(
          find_map,
          function(inner_error, result_map){
            response.send(result_map);
          }
        );
      }
    );
  });

  app.post('/:obj_type/update/:id([0-9]+)', function(request, response){
    var find_map = { _id: makeMongoId(request.params.id)},
    obj_map = request.body;
    dbHandle.collection(
      request.params.obj_type,
      function(outer_error, collection){
        var sort_order = [],
          options_map = {
            'new': true, upsert: false, safe: true
          };
        collection.findAndModify(
          find_map,
          sort_order,
          obj_map,
          options_map,
          function(inner_error, updated_map){
            response.send(updated_map);
          }
        );
      }
    )
  });

  app.get('/:obj_type/delete/:id([0-9]+)', function(request, response){
    var find_map = {_id: makeMongoId(request.params.id)};

    dbHandle.collection(
      request.params.obj_type,
      function(outer_error, collection){
        var options_map = {safe:true, single: true};

        collection.remove(
          find_map,
          options_map,
          function(inner_error, delete_count){
            response.send({delete_ccount: delete_count});
          }
        );
      }
    );
  });

};

module.exports = {configRoutes:configRoutes};
//-------------------------------End public methods
//-------------------------------Begin Module initialization
dbHandle.open(function(){
  console.log('** Connected to MongoDB **');
});
//-------------------------------End Module initialization