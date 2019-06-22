// REGEX patterns used to validate input
  const regex_currency = /^((\d+)(\.\d{2})?)$/;
  const regex_float = /^\d+(\.\d)?$/;

  window.onload = () => {
// not sure I need anything here
  }


  $("#submit").on("click", (e) => {
    console.log('Submit clicked');
    e.preventDefault();
    console.log(e);
    // get values from form. Trim empty spaces off string. Remove leading zeroes
    let cost = $("#cost").val().trim();
    console.log("cost: " + cost);
    let tipPercent = $("#tip").val().trim();
    console.log("tip: " + tipPercent);
    let split = $("#split").val().trim();
    console.log("split: " + split);
    
    // Validation
    let errorMsg = "";
    if ( !isValidCurrency(cost) ) {
      errorMsg = errorMsg + "\nInvalid Cost of Meal value"
    }
    if ( !isValidTip(tipPercent) ) {
      // Validate tip percent input
      errorMsg = errorMsg + "\nInvalid Tip Percentage value"
    }

    if (errorMsg !== "" ) {
      alert(errorMsg)
    } else {
      console.log('Calculating tip');
    }

  })

  /**
   * Validates currency format (####.##)
   * @param {*} value 
   */
  const isValidCurrency = (value) => {
    console.log(`in isValidCurrency: ${value}`)
    if (value.match(regex_currency) === null ) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * 
   * @param {*} num 
   */
  const isValidTip = (num) => {
    console.log(`in isValidTip: ${num}`)

    if (num.match(regex_float) === null) {
      return false;
    } else {
      return true;
    }
  }

  const clearFormFields = () => {
    $("#cost").val('');
    $("#tip").val('');
    $("#split").val('1');
  }

