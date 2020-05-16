// Server variables
var path = require('path');
var timesyncServer = require('timesync/server');
var express = require('express')
var app = express();
var server = require('http').Server(app);
const io = require('socket.io')(server);
var port = 8080;

// Clients
var allClients = [];
var startTime;
var intervalTimer;
var beatCounts = 0;
var BPM = 120
var rate = 60000/BPM

// Delay start time to send out to client
var DELAY_INTERVALS = 1;

// Set up server
server.listen(port);
console.log('Server listening at http://localhost:' + port);

// serve static index.html
app.use(express.static(path.join(__dirname, 'src')));

// handle timesync requests
app.use('/timesync', timesyncServer.requestHandler);

// Track socket connections
io.on('connection', function (socket) {
  // On connection, calculate a new start time based on rate and emit it
  // If first client, set up start time
  if (startTime == null){
    // Set up start time, sync time
    console.log("Start timer")
    beatCounts = 0;
    startTime = Date.now()
    clearInterval(intervalTimer);
    intervalTimer = setInterval(function(){
      ++beatCounts;
      console.log(beatCounts);
    }, rate)
  }


  // Send calculated start time to client

  // If session already exists, calculate start time using existing start time
  allClients.push(socket);
  console.log("number of clients: " + allClients.length)

  socket.on('play', function() {
    console.log("Play called");
    sendNextBeat(socket);
  });

  socket.on('disconnect', function() {
      var i = allClients.indexOf(socket);
      allClients.splice(i, 1);
      console.log("number of clients: " + allClients.length)
      // If last client, set start time to null
      if(allClients.length == 0){
        console.log("reset timer")
        startTime = null;
        clearInterval(intervalTimer);
        beatCounts = 0;
      }
   });
  // Listen for clients synching time
  socket.on('timesync', function (data) {
    // console.log('message', data);
    socket.emit('timesync', {
      id: data && 'id' in data ? data.id : null,
      result: Date.now()
    });
  });
});

function sendNextBeat(socket){
  console.log(Date.now()-startTime)
  console.log(beatCounts*rate)
  var nextBeat = startTime + beatCounts*rate + rate;
  console.log("nextBeat: " , nextBeat)
  socket.emit('nextBeat', {
    nextBeat: nextBeat,
    rate: rate
  });
}
