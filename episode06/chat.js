var http = require('http'),
    util = require('util'),
    fs   = require('fs'),
    ws   = require('./ws.js');

var clients = [];

http.createServer(function(request, response) {
  response.writeHead(200, {
    'Content-Type': 'text/html'
  });
  
  var rs = fs.createReadStream(__dirname + '/template.html');
  util.pump(rs, response);
  
}).listen(4000);

ws.createServer(function(websocket) {

  console.log(websocket);

  var username;
  
  websocket.on('connect', function(resource) {
    console.log('---');
    console.log(resource);
    clients.push(websocket);
    websocket.write('Welcome to this chat server!');
    websocket.write('Please input your username:');
  });
  
  websocket.on('data', function(data) {
    console.log('===');
    console.log(data);
    console.log(clients);

    if (!username) {
      username = data.toString();
      websocket.write('Welcome, ' + username + '!');
      return;
    }
    
    var feedback = username + ' said: ' + data.toString();
    
    clients.forEach(function(client) {
      client.write(feedback);
    });
  });
  
  websocket.on('close', function() {
    console.log('close...');
    var pos = clients.indexOf(websocket);
    if (pos >= 0) {
      clients.splice(pos, 1);
    }
  });
  
}).listen(8080);
