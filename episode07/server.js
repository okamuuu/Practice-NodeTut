var http = require('http'),    
    util = require('util'),
    fs   = require('fs');
 

var server = http.createServer(function(request, response) {
  response.writeHead(200, {
    'Content-Type': 'text/html'
  }); 
  
  var rs = fs.createReadStream(__dirname + '/server.html');
  util.pump(rs, response);
  
});


var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
  console.log('hoge');
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

server.listen(4000);
