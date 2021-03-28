var userId = null

AFRAME.registerComponent("MarkerHandler", {
init: async function() {

    if (tableNumber === null) {
        this.askTableNumber();
      }
  
      
  
      //makerFound Event
      this.el.addEventListener("markerFound", () => {
        if (userId !== null) {
          var markerId = this.el.id;
          this.handleMarkerFound(toys, markerId);
        }
      });

    this.el.addEventListener("makerLost",()=>{
        console.log("marker is lost")
        this.handleMarkerLost()
    });
},

askUserId: function () {
    var iconUrl = "./assets/Toy Shop.jpg";
    swal({
      title: "Welcome to TOY SHOP!!",
      icon: iconUrl,
      content: {
        element: "input",
        attributes: {
          placeholder: "Type your uid Ex:(UO1)",
          type: "number",
          min: 1
        }
      },
      closeOnClickOutside: false,
    }).then(inputValue => {
      userId = inputValue;
    });
  },

  handleMarkerFound: function(){

    // Getting today's day
    var todaysDate = new Date();
    var todaysDay = todaysDate.getDay();
    // Sunday - Saturday : 0 - 6
    var days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ];


    //Get the toy based on ID
    var toys = toys.filter(toys => toys.id === markerId)[0];

    //Update UI conent VISIBILITY of AR scene(MODEL ,DESCRIPTION & PRICE)
    var model = document.querySelector(`#model-${toys.id}`);
    model.setAttribute("visible", true);

    var toys_description = document.querySelector(`#main-plane-${toys.id}`);
    toys_description.setAttribute("visible", true);

    var priceplane = document.querySelector(`#price-plane-${toys.id}`);
    priceplane.setAttribute("visible", true)

    //Check if the toy is available 
    if (toys.unavailable_days.includes(days[todaysDay])) {
      swal({
        icon: "warning",
        title: toys.toys_name.toUpperCase(),
        text: "This dish is not available today!!!",
        timer: 2500,
        buttons: false
      });
    } else {
      //Changing Model scale to initial scale
      var model = document.querySelector(`#model-${toys.id}`);
      model.setAttribute("position", toys.model_geometry.position);
      model.setAttribute("rotation", toys.model_geometry.rotation);
      model.setAttribute("scale", toys.model_geometry.scale);
    
      //Change the button div visiblity
      var buttonDiv = document.getElementById("button-div")
      buttonDiv.style.display = "flex"

      var ratingButton = document.getElementById("rating-button")
      var orderButtton = document.getElementById("order-button")

      if (tableNumber != null) {
        //Handling Click Events
        ratingButton.addEventListener("click", function () {
          swal({
            icon: "warning",
            title: "Rate Dish",
            text: "Work In Progress"
          });
        });


        orderButtton.addEventListener("click", () => {
          var userId;
          userId = id ? (userId = `T0${userId}`) : `T${userId}`;
          this.handleOrder(userId, toys);

          swal({
            icon: "https://i.imgur.com/4NZ6uLY.jpg",
            title: "Thanks For Order !",
            text: "Your order will serve soon on your table!",
            timer: 2000,
            buttons: false
          });
        });
      }
    }
  },

  handleOrder: function (userId, toys) {
    // Reading current orders userId details
    firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .get()
      .then(doc => {
        var details = doc.data();

        if (details["current_orders"][toys.id]) {
          // Increasing Current Quantity
          details["current_orders"][toys.id]["quantity"] += 1;

          //Calculating Subtotal of item
          var currentQuantity = details["current_orders"][toys.id]["quantity"];

          details["current_orders"][toys.id]["subtotal"] =
            currentQuantity * toys.price;
        } else {
          details["current_orders"][toys.id] = {
            item: toys.toys_name,
            price: toys.price,
            quantity: 1,
            subtotal: toys.price * 1
          };
        }

        details.total_bill += toys.price;

        //Updating db
        firebase
          .firestore()
          .collection("users")
          .doc(doc.id)
          .update(details);
      });
  },

  //function to get the toys collection from firestore database
  getToys: async function() {
    return await firebase
      .firestore()
      .collection("Toys")
      .get()
      .then(snap => {
        return snap.docs.map(doc => doc.data());
      });
  },
  handleMarkerLost: function (){
    //Change the button div visiblity
    var buttonDiv = document.getElementById("button-div")
    buttonDiv.style.display = "none"
  }
})
