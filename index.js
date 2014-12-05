var app = require('express')();
var bp = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var clients = {};

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/listClients', function(req, res){
  var c = "";
  for(var id in clients){
    c = c + "<p>" + id + "</p>";
  }
  res.send("" + c);
});

var parser = bp.json();

app.post('/getSettings', parser, function(req, res) {
  console.log("### params: " + JSON.stringify(req.body));
  clients[req.body.id].emit('get settings', req.body.settings);
  res.send("ok");
});

app.post('/setSettings', parser, function (req, res) {
  console.log("### params: " + JSON.stringify(req.body));
  clients[req.body.id].emit('set settings', req.body.settings);
  res.send("ok");
});

io.on('connection', function(socket){
  clients[socket.id] = socket;
  socket.emit('browser registered', socket.id);
  console.log('## a new browser has been registered with id: ' + socket.id);

  socket.on('got settings', function(settings) {
    console.log("## settings retrieved from browser with id: " + socket.id);
    console.log("## settings: " + JSON.stringify(settings, null, 4));
  });

  socket.on('settings applied', function (returnPayload) {
    console.log("## settings applied in browser with id: " + socket.id);
    console.log("## response is: " + JSON.stringify(returnPayload, null, 4));
  });

  socket.on('disconnect', function(){
    console.log('## a browser has disconnected with id: ' + socket.id);
    delete(clients[socket.id]);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
