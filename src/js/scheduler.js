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

  var first = true;
  function emitPlay(){
    // Get around playing from user click
    if (first){
      play()
      play()
      first = false
    }

    if(!isPlaying){
      socket1.emit('play');
      $(".play").html("wait");
    } else{
      $(".play").html(play());
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
    console.log("nextBeat and rate received: ", data);
    // Set play based on startTime and rate
    // Temp fake nextBeat

    rate = data.rate
    var nextBeat = data.nextBeat;
    // Calculate next beat
    // Wait until next beat, set interval
    var now = ts.now()
    console.log("Next beat: ", nextBeat)
    console.log("Now: ", now)
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
    }, timeDifference);

  });
