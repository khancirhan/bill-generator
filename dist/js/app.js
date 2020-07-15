/* Implementing Module pattern */

/*
  -----------------------------------------Backend Module-----------------------------------------
*/
var billController = (function() {
  // function constructor for representing each Bill Item (acts as a class for each object)

  var Bill = function(id, quantity, description, rate) {
    // same as <function Bill(id, quantity, description, rate) {};>
    this.id = id;
    this.quantity = quantity;
    this.description = description;
    this.rate = rate;
    this.price = quantity * rate;
  };

  // Datastructure to store each bill item and also store the total amount
  var data = {
    allItems: [],
    total: 0
  };

  // function to add new item
  function saveItem(quantity, description, rate) {
    var id, newItem;

    if (data.allItems.length > 0) {
      // id = last id + 1
      id = data.allItems[data.allItems.length - 1].id + 1;
    } else {
      id = 0;
    }

    // Create new item (a new row in the bill)
    newItem = new Bill(id, quantity, description, rate);

    // Add item to the data structure
    data.allItems.push(newItem);

    return newItem;
  }

  function removeItem(id) {
    var ids, index;

    // Get id's (indexes) of all items currently in the data structure and save them in an array
    ids = data.allItems.map(function(current) {
      return current.id;
    });

    // Get current index of the item in the data structure
    index = ids.indexOf(id);

    if (index !== -1) {
      data.allItems.splice(index, 1);
    }
  }

  // function to calculate the total
  function calcTotal() {
    var sum = 0.0;

    data.allItems.forEach(function(current, index, array) {
      sum += current.price;
    });

    data.total = sum;
  }

  // function to return the total
  function getTotal() {
    return data.total;
  }

  // Return public functions
  return {
    saveItem: saveItem,
    calcTotal: calcTotal,
    getTotal: getTotal,
    removeItem: removeItem
  };
})();

/*
  -----------------------------------------UI Module-----------------------------------------
*/
var UIController = (function() {
  // Datastructure representing to store class or id values of the UI
  var DOMStrings = {
    ipQuantity: "quantity",
    ipDescription: "description",
    ipRate: "rate",
    ipBtn: "ipBtn",
    itemContainer: "tableBody",
    showcaseTotal: "showcaseTotal",
    opTotal: "total",
    date: "date"
  };

  function getDOMStrings() {
    // Returns DOM Strings
    return DOMStrings;
  }

  function getInput() {
    // Returns an object containing input data taken from the UI
    return {
      quantity: parseFloat(
        document.getElementById(DOMStrings.ipQuantity).value
      ),
      descrption: document.getElementById(DOMStrings.ipDescription).value,
      rate: parseFloat(document.getElementById(DOMStrings.ipRate).value)
    };
  }

  function addListItem(item) {
    // 1. Create HTML string with placeholder text
    html =
      '<tr id="item-%id%"> <td>%qty%</td> <td>%des%</td> <td>%rate%</td> <td>%price%<i class="delete-item fa fa-times"></i></td> </tr>';

    // 2. Replace placeholder text with actual data
    html = html.replace("%id%", item.id);
    html = html.replace("%qty%", item.quantity);
    html = html.replace("%des%", item.description);
    html = html.replace("%rate%", formatNumer(item.rate));
    html = html.replace("%price%", formatNumer(item.price));

    // 3. Insert the HTML into the DOM
    document
      .getElementById(DOMStrings.itemContainer)
      .insertAdjacentHTML("beforeend", html);
  }

  function deleteListItem(itemID) {
    var el;
    el = document.getElementById(itemID);

    // Remove element from the parent
    el.parentNode.removeChild(el);
  }

  function clearInputFields() {
    qty = document.getElementById(DOMStrings.ipQuantity);
    qty.value = "";
    document.getElementById(DOMStrings.ipDescription).value = "";
    document.getElementById(DOMStrings.ipRate).value = "";

    // Focus on the 1st element
    qty.focus();
  }

  function displayTotal(total) {
    document.getElementById(DOMStrings.showcaseTotal).textContent =
      "+" + formatNumer(total);
    document.getElementById(DOMStrings.opTotal).textContent =
      "+" + formatNumer(total);
  }

  function formatNumer(num) {
    var num, numSplit, intPart, decPart;
    // Set decimal digits to 2
    num = num.toFixed(2);

    // Split the integer and decimal part
    numSplit = num.split(".");

    intPart = numSplit[0];
    decPart = numSplit[1];

    if (intPart.length > 3) {
      // Add a comma after the three digits
      intPart =
        intPart.substr(0, intPart.length - 3) +
        "," +
        intPart.substr(intPart.length - 3, 3);
    }

    return intPart + "." + decPart;
  }

  function displayDate() {
    var now, day, month, year;

    now = new Date();

    year = now.getFullYear();

    months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];

    monthNum = now.getMonth();

    day = now.getUTCDate();

    document.getElementById(DOMStrings.date).textContent =
      months[monthNum] + " " + day + ", " + year;
  }

  // Return functions to make them available to the public interface (in this case GLobal Controller Module)
  return {
    getDOMStrings: getDOMStrings,
    getInput: getInput,
    addListItem: addListItem,
    clearFields: clearInputFields,
    displayTotal: displayTotal,
    deleteListItem: deleteListItem,
    displayDate: displayDate
  };
})();

/*
  -----------------------------------------Global App Controller Module-----------------------------------------
*/
var controller = (function(billCtrl, UICtrl) {
  var setupEventListeners = function() {
    // same as <function setupEventListeners() {};>
    var DOM = UICtrl.getDOMStrings();

    // Add event listener to the ip-btn
    document.getElementById(DOM.ipBtn).addEventListener("click", addCtrlItem);

    // Add event listener to the "Enter" keypress
    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        addCtrlItem();
      }
    });

    // Add event listener to the table body
    document
      .getElementById(DOM.itemContainer)
      .addEventListener("click", removeCtrlItem);
  };

  var updateTotal = function() {
    var total;
    // 1. Calculate the total
    billCtrl.calcTotal();

    // 2. Return the total
    total = billCtrl.getTotal();

    // 3. Display total on the UI
    UICtrl.displayTotal(total);
  };

  var addCtrlItem = function() {
    var input, item;

    // 1. Get User Input from UI
    input = UICtrl.getInput();

    if (
      !isNaN(input.quantity) &&
      input.quantity > 0 &&
      !isNaN(input.rate) &&
      input.rate > 0
    ) {
      // 2. Save item into the data structure
      item = billCtrl.saveItem(input.quantity, input.descrption, input.rate);

      // 3. Add item to the UI
      UICtrl.addListItem(item);

      // 4. Clear Fields in the UI
      UICtrl.clearFields();

      // 5. Calculate total and update the UI
      updateTotal();
    }
  };

  var removeCtrlItem = function(event) {
    var itemID, splitArr, id;

    itemID = event.target.parentNode.parentNode.id;

    splitArr = itemID.split("-"); // E.g. ["item", "0"]

    if (splitArr[0] === "item") {
      id = parseInt(splitArr[1]);

      // 1. Remove item from the data structure
      billCtrl.removeItem(id);

      // 2. Remove item from the UI
      UICtrl.deleteListItem(itemID);

      // // 3. Calculate total and update the UI
      updateTotal();
    }
  };

  return {
    init: function() {
      console.log("Application has started.");
      UICtrl.displayDate();
      setupEventListeners();
    }
  };
})(billController, UIController);

/*
  ------------------------------------------------------------------------------------------------
*/

// Start App
controller.init();
