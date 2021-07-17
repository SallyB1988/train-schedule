// Initialize Firebase
var config = {
  apiKey: "AIzaSyCSClrgNsPCqFoavoMkImbxKfAMhfG6qfg",
  authDomain: "train-schedule-b0078.firebaseapp.com",
  databaseURL: "https://train-schedule-b0078.firebaseio.com",
  projectId: "train-schedule-b0078",
  storageBucket: "train-schedule-b0078.appspot.com",
  messagingSenderId: "689100492566",
};
firebase.initializeApp(config);

const trainDB = firebase.database();

// Variables
var minutesLeft = 0;
// REGEX pattern used to validate military time format  (HH:mm)
const regex_pattern = /^([0-1][0-9]|(2[0-3])):[0-5][0-9]$/;
const regex_num = /^\d+$/;
const $table = $("#train-table");

window.onload = () => {
  // Get current seconds. Wait until the remainder of the current minute passes
  // and then start the setInterval. I want to start the setInterval so it changes every
  // minute at the 0 second point.
  var curSeconds = moment().format("s");
  setTimeout(() => {
    refreshTrainTable();
    startTableUpdate();
  }, (60 - curSeconds) * 1000);
};

const addNewTrain = (name, from, firstTrain, freq, arrival) => {
  trainDB.ref().push({
    name: name,
    from: from,
    firstTrain: firstTrain,

    // frequency: freq.toString(),
    frequency: freq,
    arrival: arrival,
    dateAdded: firebase.database.ServerValue.TIMESTAMP,
  });
};

trainDB.ref().on("child_added", (snap) => {
  const added = snap.val();
  appendTableRow(added);
});

const appendTableRow = (obj) => {
  minLeft = timeToNext(obj.firstTrain, obj.frequency);
  let nextTrain = moment().add(minLeft, "minutes").format("hh:mm A");
  $table.append(`
      <tr class="table-row">
        <td>${obj.name}</td>
        <td>${obj.from}</td>
        <td>${obj.frequency}</td>
        <td>${nextTrain}</td>
        <td id="min-left">${minLeft}</td>
      </tr>
    `);
};

$("#submit").on("click", (e) => {
  let nextArrival;
  let minutesLeft;
  e.preventDefault();
  const name = $("#name").val().trim();
  const from = $("#from").val().trim();
  const firstTrain = $("#first-train").val().trim();
  const frequency = $("#frequency").val().trim();

  // Check if frequency is a number greater than 0
  if (!isInteger(frequency) || frequency < 0) {
    alert("Invalid frequency entry format");
  } else if (!isValidTimeFormat(firstTrain)) {
    alert("Invalid first train time format");
  } else {
    minutesLeft = timeToNext(firstTrain, frequency);
    nextArrival = moment().add(minutesLeft, "minutes").format("hh:mm A");
    addNewTrain(name, from, firstTrain, frequency, nextArrival, minutesLeft);
    clearFormFields();
  }
});

/**
 * Validates time is in military time format (HH:mm)
 * @param {*} time
 */
const isValidTimeFormat = (time) => {
  if (time.match(regex_pattern) === null) {
    return false;
  } else {
    return true;
  }
};

const isInteger = (num) => {
  if (num.match(regex_num) === null) {
    return false;
  } else {
    return true;
  }
};

const clearFormFields = () => {
  $("#name").val("");
  $("#from").val("");
  $("#first-train").val("");
  $("#frequency").val("");
};

/**
 * Calculates the time until the next train arrives
 *
 * @param {} first
 * @param {*} freq
 */
const timeToNext = (first, freq) => {
  let minutesLeft = 0;
  const timeNow = moment();
  const timeToFirst = moment(first, "HH:mm").diff(timeNow, "minutes");

  if (timeToFirst > 0) {
    // if first train hasn't arrived yet
    minutesLeft = timeToFirst + 1;
  } else {
    const timeSinceFirstTrain = Math.abs(timeToFirst);
    minutesLeft = freq - (timeSinceFirstTrain % freq);
  }

  return minutesLeft;
};

const refreshTrainTable = () => {
  $("#train-table").empty(); // clear out table
  trainDB
    .ref()
    .once("value")
    .then(function (snap) {
      const data = snap.val();
      const keys = Object.keys(data);
      keys.forEach((k) => {
        appendTableRow(data[k]);
      });
    });
};

// This updates the minutes away time every minute
const startTableUpdate = () => {
  timerId = setInterval(() => {
    refreshTrainTable();
  }, 60 * 1000);
};
