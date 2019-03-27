
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

  // window.onload = () => {
  // // Get current seconds. Wait until the remainder of the current minute passes
  // // and then start the setInterval. I want to start the setInterval so it changes every
  // // minute at the 0 second point.
  //   var curSeconds = moment().format("s");
  //   console.log('curseconds: ' + curSeconds);
  //   setTimeout(startTableUpdate,(60-curSeconds)*1000)

  // }

  const addNewTrain = (name, dest, firstTime, freq, arrival) => {
    trainDB.ref().push({
      name: name,
      destination: dest,
      firstTime: firstTime,
      frequency: freq.toString(),
      arrival: arrival,
      dateAdded: firebase.database.ServerValue.TIMESTAMP,
    });

  }

  trainDB.ref().on("child_added", (snap) => {
    const added = snap.val();
    const $table = $("#train-table");

    minutesLeft = timeToNext(added.firstTime, added.frequency);
    let nextArrival = moment().add(minutesLeft,"minutes").format("hh:mm A");

    $table.append(`
      <tr class="table-row">
        <td>${added.name}</td>
        <td>${added.destination}</td>
        <td>${added.frequency}</td>
        <td>${nextArrival}</td>
        <td id="min-left">${minutesLeft}</td>
      </tr>
    `)

  })

  $("#submit").on("click", (e) => {
    let nextArrival;
    let minutesLeft;
    e.preventDefault();
    const name = $("#name").val().trim();
    const destination = $("#destination").val().trim();
    const firstTime = $("#first-time").val().trim();
    const frequency = $("#frequency").val().trim();
    
    if (!checkValidTime(firstTime)) {
      alert('bad time format');
    } else {
      minutesLeft = timeToNext(firstTime, frequency);
      let nextArrival = moment().add(minutesLeft,"minutes").format("hh:mm A");
      addNewTrain(name, destination, firstTime, frequency, nextArrival, minutesLeft);
    };
    startTableUpdate();
    
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

//  SALLY --- this isn't working correctly!

    if (timeToFirst > 0) {    // first train hasn't arrived yet
      minutesLeft = timeToFirst;
    } else {
      const timeSinceFirstTrain = Math.abs(timeToFirst);
      minutesLeft = freq - (timeSinceFirstTrain%freq);
    }
    return minutesLeft;

  }


  // This updates the minutes away time every minute
  const startTableUpdate = () => {
    console.log('in startTableUpdate')
    // timerId = setInterval(() => {
      const tableRow = $(".table-row");
      console.log(tableRow.length);
      var newRowMin = 0;
      for (i=0; i<tableRow.length; i++) {
        newRowMin = tableRow[i].children[4].lastChild.data - 1;   // this finally got to the minutes away number!
        // need some sort of id for the 
      }
    // }, 60 * 1000);
  }

