
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

  const addNewTrain = (name, dest, firstTime, freq, arrival, minAway) => {
    trainDB.ref().push({
      name: name,
      destination: dest,
      firstTime: firstTime,
      frequency: freq.toString(),
      arrival: arrival,
      minAway: minAway,
      dateAdded: firebase.database.ServerValue.TIMESTAMP,
    });

  }

  trainDB.ref().on("child_added", (snap) => {
    const added = snap.val();
    const $table = $("#train-table");
    $table.append("<tr>").append(
      $("<td>").text(added.name),
      $("<td>").text(added.destination),
      $("<td>").text(added.frequency),
      $("<td>").text("calc arrival"),
      $("<td>").text("calc min away"),
    )

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
      [nextArrival, minutesLeft] = timeToNext(firstTime, frequency);
      addNewTrain(name, destination, firstTime, frequency, nextArrival,  minutesLeft);
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
    const timeNow = moment();
    const timeSinceFirstTrain = Math.abs(moment(first,"HH:mm").diff(timeNow,"minutes"));
    const timeUntilNext = freq - (timeSinceFirstTrain%freq);
    const nextArrival = moment().add(timeUntilNext,"minutes").format("hh:mm A");
    return [nextArrival, timeUntilNext];

  }