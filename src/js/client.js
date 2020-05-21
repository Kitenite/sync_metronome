// Socket
var socket = io.connect();

// metronome tracker
var tempo = 120;
var rate = 60000/tempo;
var playInterval;
var firstPlay = true;
var waitingForBeat = false;

// timesync
var ts = timesync.create({
  server: socket,
  interval: 5000
});

// Media client handlers
function emitPlay(){
  // Activate playing onclick, necessary for browsers
  if (firstPlay){
    play()
    play()
    firstPlay = false
  }

  // Request next beat from server
  if(!isPlaying){
    socket.emit('requestNextBeat');
    $("#play-button").attr("src","/images/wait.png");
    waitingForBeat = true
  } else{
    playBeat()
    waitingForBeat = false
  }
}

// Receive next beat from server
socket.on('nextBeatSent', function (data) {
  if (!waitingForBeat){
    console.log("not ready")
    return
  }
  updateTempo(data.tempo)
  var nextBeat = data.nextBeat
  timeDifference = nextBeat - ts.now();
  while (timeDifference <= 0){
    nextBeat+=rate
    timeDifference = nextBeat - ts.now();
  }
  setTimeout(function(){
    playBeat()
    if (!isPlaying){
      playBeat()
    }
  }, timeDifference);
});

socket.on("clientCount", function(data){
  $("#client-count").html(data.count)
});

// New tempo received, update if changed
function updateTempo(new_tempo){
  if (new_tempo != tempo){
    tempo = new_tempo
    rate = 60000/tempo
    $("#tempo-scroll").val(tempo)
    $("#tempo-display").html(tempo);
  }
}

// Send new tempo to server
function sendTempo(){
  tempo = $("#tempo-scroll").val();
  socket.emit("requestNewTempo", {tempo: tempo})
}

// Sync all clients
function sync(){
  socket.emit("syncDevices")
}

// Auxiliary change to tempo,
function tempoChange(amount){
  var newTempo = parseInt($("#tempo-scroll").val()) + amount;
  $("#tempo-scroll").val(newTempo)
  $("#tempo-display").html(newTempo);
}

function playBeat(){
  if (play()){
    $("#play-button").attr("src","/images/play.png");
  } else{
    $("#play-button").attr("src","/images/pause.png");
  }
}

function blink(div){
  div.removeClass("makeBlink");
   setTimeout(function() {
     div.addClass("makeBlink");
   }, 1);
}


// Time sync handlers
socket.on('timesync', function (data) {
  ts.receive(null, data);
});

ts.send = function (socket, data, timeout) {
  return new Promise(function (resolve, reject) {
    var timeoutFn = setTimeout(reject, timeout);
    socket.emit('timesync', data, function () {
      clearTimeout(timeoutFn);
      resolve();
    });
  });
};

// Not used handlers, kept for reference

// ts.on('sync', function (state) {
//   console.log(state)
// });
// ts.on('change', function (offset) {
//   console.log('changed offset: ' + offset + ' ms');
// });
