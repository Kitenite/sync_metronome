// Socket
var socket = io.connect();

// metronome tracker
var rate;
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
    $("#play-button").html("wait");
    waitingForBeat = true
  } else{
    $("#play-button").html(play());
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
  // console.log("Starting in: " + timeDifference +"ms");
  setTimeout(function(){
    $("#play-button").html(play());
    if (!isPlaying){
      $("#play-button").html(play());
    }
  }, timeDifference);
});

// New tempo received, update if changed
function updateTempo(new_tempo){
  if (new_tempo != tempo){
    tempo = new_tempo
    rate = 60000/tempo
    $("#tempo").val(tempo)
    $("#showTempo").html(tempo);
  }
}

// Send new tempo to server
function sendTempo(){
  tempo = $("#tempo").val();
  socket.emit("requestNewTempo", {tempo: tempo})
}

// Sync all clients
function sync(){
  socket.emit("syncDevices")
}

// Auxiliary change to tempo,
function tempoChange(amount){
  var newTempo = parseInt($("#tempo").val()) + amount;
  $("#tempo").val(newTempo)
  $("#showTempo").html(newTempo);
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
