var http = require('http'),
    util = require('util'),
    fs   = require('fs');

var server = http.createServer(function(request, response) {
  response.writeHead(200, {
    'Content-Type': 'text/html'
  });
  
  var rs = fs.createReadStream(__dirname + '/template.html');
  util.pump(rs, response);
});

var io = require('socket.io').listen(server);

io.sockets.on('connection', function(client) {

  var username;
  
  client.send('Welcome to this socket.io chat server!');
  client.send('Please input your username: ');
  
  client.on('message', function(message) {
    if (!username) {
      username = message;
      client.send('Welcome, ' + username + '!');
      return;
    }
    client.send(username + ' sent: ' + message); // send ownself
    client.broadcast.send(username + ' sent: ' + message); // send others
  });
  
});

server.listen(4000);
