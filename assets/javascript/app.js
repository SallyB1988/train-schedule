
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyCSClrgNsPCqFoavoMkImbxKfAMhfG6qfg",
    authDomain: "train-schedule-b0078.firebaseapp.com",
    databaseURL: "https://train-schedule-b0078.firebaseio.com",
    projectId: "train-schedule-b0078",
    storageBucket: "train-schedule-b0078.appspot.com",
    messagingSenderId: "689100492566"
  };
  firebase.initializeApp(config);

  const trainDB = firebase.database();

// Variables
  var minutesLeft = 0;

  window.onload = () => {
  // Get current seconds. Wait until the remainder of the current minute passes
  // and then start the setInterval. I want to start the setInterval so it changes every
  // minute at the 0 second point.
    var curSeconds = moment().format("s");
    console.log('curseconds: ' + curSeconds);
    setTimeout(startTableUpdate,(60-curSeconds)*1000)

  }

  const addNewTrain = (name, dest, firstTrain, freq, arrival) => {
    trainDB.ref().push({
      name: name,
      destination: dest,
      firstTrain: firstTrain,
      frequency: freq.toString(),
      arrival: arrival,
      dateAdded: firebase.database.ServerValue.TIMESTAMP,
    });

  }

  trainDB.ref().on("child_added", (snap) => {
    const added = snap.val();
    const $table = $("#train-table");
    minLeft = timeToNext(added.firstTrain, added.frequency);
    let nextTrain = moment().add(minLeft,"minutes").format("hh:mm A");
    console.log('inside child_added');
    $table.append(`
      <tr class="table-row">
        <td>${added.name}</td>
        <td>${added.destination}</td>
        <td>${added.frequency}</td>
        <td>${nextTrain}</td>
        <td id="min-left">${minLeft}</td>
      </tr>
    `)
  })
  
  const appendTableRow = (obj) => {
    const $table = $("#train-table");
    minLeft = timeToNext(obj.firstTrain, obj.frequency);
    let nextTrain = moment().add(minLeft,"minutes").format("hh:mm A");
    
    $table.append(`
      <tr class="table-row">
        <td>${obj.name}</td>
        <td>${obj.destination}</td>
        <td>${obj.frequency}</td>
        <td>${nextTrain}</td>
        <td id="min-left">${minLeft}</td>
      </tr>
    `)
  }


  $("#submit").on("click", (e) => {
    let nextArrival;
    let minutesLeft;
    e.preventDefault();
    const name = $("#name").val().trim();
    const destination = $("#destination").val().trim();
    const firstTrain = $("#first-train").val().trim();
    const frequency = $("#frequency").val().trim();
    
    if (!checkValidTime(firstTrain)) {
      alert('bad time format');
    } else {
      minutesLeft = timeToNext(firstTrain, frequency);
      nextArrival = moment().add(minutesLeft,"minutes").format("hh:mm A");
      addNewTrain(name, destination, firstTrain, frequency, nextArrival, minutesLeft);
    };
    
  })

  const checkValidTime = (t) => {
    const expectedFormat = "HH:mm";
    return moment(t,expectedFormat).format() === 'Invalid date' ? false : true;
  }

  /**
   * Calculates the time until the next train arrives
   * 
   * @param {} first 
   * @param {*} freq 
   */
  const timeToNext = (first, freq) => {
    let minutesLeft = 0;
    const timeNow = moment();
    const timeToFirst = moment(first,"HH:mm").diff(timeNow,"minutes");

    if (timeToFirst > 0) {    // if first train hasn't arrived yet
      minutesLeft = timeToFirst + 1;  
    } else {
      const timeSinceFirstTrain = Math.abs(timeToFirst);
      minutesLeft = freq - (timeSinceFirstTrain%freq);
    }

    return minutesLeft;
  }

  // This updates the minutes away time every minute
  const startTableUpdate = () => {
    timerId = setInterval(() => {
      $("#train-table").empty();    // clear out table
      trainDB.ref().once('value').then(function(snap){
        const data = snap.val();
        const keys = Object.keys(data);
        console.log('inside startTableUpdate')
        keys.forEach((k) => {
          appendTableRow(data[k]);
        })
      });
    }, 60 * 1000)
  }