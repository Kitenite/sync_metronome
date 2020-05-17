  // Metronome part
  var rate;
  var playInterval;
  var socket1 = io('http://localhost:8080');

  var ts = timesync.create({
    server: socket1,
    interval: 5000
  });

  ts.on('sync', function (state) {
    // Reflect sync on next beat
  });

  var firstActivate = true;
  var readyToPlay = false;
  function emitPlay(){
    // Get around playing from user click
    if (firstActivate){
      play()
      play()
      firstActivate = false
    }
    if(!isPlaying){
      socket1.emit('play');
      $(".play").html("wait");
      readyToPlay = true
    } else{
      $(".play").html(play());
      readyToPlay = false
    }
  }

  ts.on('change', function (offset) {
    console.log('changed offset: ' + offset + ' ms');
  });

  ts.send = function (socket, data, timeout) {
    // console.log('send', data);
    return new Promise(function (resolve, reject) {
      var timeoutFn = setTimeout(reject, timeout);
      socket.emit('timesync', data, function () {
        clearTimeout(timeoutFn);
        resolve();
      });
    });
  };

  socket1.on('timesync', function (data) {
    // console.log('receive', data);
    ts.receive(null, data);
    // Correct internal next beat
  });

  socket1.on('nextBeat', function (data) {
    // Receive next beat from server, call schedule on next beat

    if (readyToPlay){
      console.log("nextBeat and rate received: ", data);
      // Set play based on startTime and rate
      // Temp fake nextBeat
      // set new rate
      updateTempo(data.tempo)
      var nextBeat = data.nextBeat;
      // Calculate next beat
      // Wait until next beat, set interval
      var now = ts.now()
      timeDifference = nextBeat - now;
      if (timeDifference <= 0){
        timeDifference += rate
      }
      console.log("Starting in: " + timeDifference +"ms");
      setTimeout(function(){
        // clearInterval(playInterval);
        // set new interval to play sound at rate
        // playInterval = setInterval(playSound, rate);
        $(".play").html(play());
        if (!isPlaying){
          $(".play").html(play());
        }
      }, timeDifference);
    } else {
      console.log("not ready")
    }
  });

  function updateTempo(new_tempo){
    console.log("Old tempo: ", tempo)
    console.log("newTempo: ", new_tempo)
    // tempo = event.target.value;
    // document.getElementById('showTempo').innerText=tempo;
    if (new_tempo != tempo){
      tempo = new_tempo
      rate = 60000/tempo
      $("#tempo").val(tempo)
      $("#showTempo").html(tempo);
    }
  }

  function sendTempo(){
    tempo = $("#tempo").val();
    socket1.emit("newTempo", {tempo: tempo})
  }
