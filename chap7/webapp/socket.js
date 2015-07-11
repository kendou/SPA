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

var
  countUp,
  http = require('http'),
  express = require('express'),
  socketIo = require('socket.io'),
  app = express(),
  server = http.createServer(app),
  io = socketIo.listen(server),
  countIdx = 0;
//------------------------End Module scope variables

countUp = function(){
  countIdx ++;
  console.log(countIdx);
  io.sockets.send(countIdx);
};

app.use(express.static(__dirname + '/'));

app.get('/', function(request, response){
  response.redirect('/socket.html');
});

server.listen(5000);
console.log(
  'Express server listenening on port %d in %s mode',
  server.address().port, app.settings.env
);

setInterval(countUp, 1000);
//----------------------End