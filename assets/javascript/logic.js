let pantry = [];
let shoppingList = [];
let isLoggedIn = false;
let userData;

$(document).ready(function() {
    if (!isLoggedIn) { //not logged in yet
        //Redirect to login screen
        console.log("usernot found");
    } else { //already logged in
        // generatePantry();
        generateShoppingList();
        generateCalendar();
    }
});

// Firebase Config
var config = {
    apiKey: "AIzaSyBmxS4V7it_sK4jjGlZNxrPftrb6BCn0G8",
    authDomain: "food-for-thought-bb3d4.firebaseapp.com",
    databaseURL: "https://food-for-thought-bb3d4.firebaseio.com",
    projectId: "food-for-thought-bb3d4",
    storageBucket: "food-for-thought-bb3d4.appspot.com",
    messagingSenderId: "504782992813"
};
firebase.initializeApp(config);
database = firebase.database();

//--------------------------------------------------
//              Page Setup Functions
//--------------------------------------------------


//Generate the pantry html object and display it
function generatePantry() {

    $("#pantry-list-div").html("");

    $.each(pantry, function(index, value) {
            // console.log("WARNING: need real location of pantry html element.")

            $("#pantry-list-div").append(createFoodItemHTML(value));

            updateFirebase("pantry", value)
        })
        // console.log("WARNING: pantry page not implemented")
        // console.log("pantry contents", pantry);

}


//Generate the shopping list html object and display it
function generateShoppingList() {
    $.each(shoppingList, function(index, value) {
        console.log("WARNING: need real location of shopping list html element.")

        $("#shopping-list-div").append(createPantryItemHTML(value));
    })

    console.log("WARNING: shopping list page not implemented")
    console.log("shopping list contents", shoppingList);

}

//Generate the calendar with all meals planned or load the google calendar if that's what we're doing.
function generateCalendar() {
    console.log("WARNING: generateCalendar Not currently implemented");
}



//--------------------------------------------------
//             JSON to object
//--------------------------------------------------


function createRecipeObject(recipeJSON) {
    return new recipe(recipeJSON);
}

function createFoodItemObject(foodItemJSON) {
    return new foodItem(foodItemJSON);
}




//--------------------------------------------------
//             Object to HTML
//--------------------------------------------------

function addItemToPantry(foodObject) {
    console.log(foodObject.name, "Added to pantry.");
    // updateFirebase("pantry", foodObject);

    pantry.push(foodObject);
    console.log(foodObject.html());
    updateFirebase("pantry", foodObject);
    generatePantry();
}

function addItemToShoppingList(foodObject) {
    console.log(foodObject.name, "Added to shopping list.");

    shoppingList.push(foodObject);
    generateShoppingList();
}

function createRecipeHTML(recipeObject) {
    let containerDiv = $("<div>");
    containerDiv.attr("class", "recipe-container row")
    let imageCol = $("<div>");
    imageCol.attr("class", "col-3");
    imageCol.append($("<img class='recipe-image'>").attr("src", recipeObject.imageURL));
    containerDiv.append(imageCol);
    let nameCol = $("<div>");
    nameCol.attr("class", "col-4");
    nameCol.append($("<div class='recipe-title row>").text(recipeObject.name))
    nameCol.append($("<div class='recipe-item row>").text("Servings: " + recipeObject.servings));
    nameCol.append($("<div class='row'>").append(createNutritionHTML(recipeObject.nutrition)));
    containerDiv.append(nameCol);
    containerDiv.append("<span>").html(createNutritionHTML(recipeObject.nutrition));

    return recipeDiv;
}

function createFoodItemHTML(foodItemObject) {
    let containerDiv = $("<div>");
    containerDiv.append($("<span class='food-item-title'>").text(foodItemObject.name));
    containerDiv.append($("<span class='food-item-item>").text("Quantity: " + foodItemObject.quantity + foodItemObject.measurement));
    containerDiv.append($("<span>").html(createNutritionHTML(foodItemObject.nutrition)));
    containerDiv.append($("<span>").html(foodItemObject.category));
    return containerDiv;
}

function createNutritionHTML(nutritionObject) {
    let containerDiv = $("<div>");
    containerDiv.attr("class", "nutrition-container")
    containerDiv.append($("<span class='nutrition-header'>").text("Nutritional Info:"));
    containerDiv.append($("<span class='nutrition-statistic'>").text("Calories: " + nutritionObject.calories + "g"));
    containerDiv.append($("<span class='nutrition-statistic'>").text("Protien: " + nutritionObject.protien + "g"));
    containerDiv.append($("<span class='nutrition-statistic'>").text("Cholestorol: " + nutritionObject.cholestorol + "g"));

    return containerDiv
}


//--------------------------------------------------
//            UI interactions
//--------------------------------------------------



function getAccountInfo() {

    //Listener for login button
    $("#login-button").on("click", function() {
            //Get user login info
            const email = $("#user-email").val();
            const password = $("#user-password").val();
            const auth = firebase.auth();

            console.log("email: ", email);
            console.log("password: ", password);

            const promise = auth.signInWithEmailAndPassword(email, password);
            promise.catch(function(event) {
                console.log(event.message);
            })

            $("#user-email").val("");
            $("#user-password").val("");
        })
        //Listener for sign-up button
    $("#signup-button").on("click", function() {

        //Get user sign-up info
        const email = $("#signup-email").val();
        const password = $("#signup-password").val();
        const auth = firebase.auth();

        const promise = auth.createUserWithEmailAndPassword(email, password);

        promise.catch(function(event) {
            console.log("created account");
        })

        $("#signup-email").val("");
        $("#signup-password").val("");
    })

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            uuid = user.uid;
            console.log("Logged in");
            database.ref("/users/" + uuid).once("value", function(snapshot) {
                userData = snapshot;
                console.log(userData.val());
                pantry = [];
                $.each(userData.val().pantry, function(index, key) {
                    // key.bind(foodItem);
                    // var temp = new foodItem();
                    // key.html() = temp.html;
                    console.log(key.html);
                    pantry.push(key);
                })
               
                generatePantry();
                console.log("pantry", pantry);
            })
            
            // console.log(user.uid);
            // updateFirebase();
            isLoggedIn = true;
            

            // firebase.auth().onAuthStateChanged(firebaseUser => {
            //     if (firebaseUser) {
            //         console.log("Logged in");
            //         isLoggedIn = true;
        } else {
            console.log("Not logged in");
            isLoggedIn = false;
        }
    })

    $("#logout-button").on("click", function() {
        const auth = firebase.auth();
        console.log("Logged out");
        auth.signOut();
    })

    //TODO: Go through the firebase login flow
    //TODO:  Pull down the userData

}

// firebase.database().ref()

//TODO: Tie this to the actual search button for recipes
$("#recipe-search-button").click(function() {
    let searchTerm = $("#recipe-search-text").val();
    callEdaRec(searchTerm);
})

$("#searchButton").click(function() {
    let searchTerm = $("#input").val();
    callEdaFood(searchTerm);
})

$("#add-item-btn").click(function(event) {
    event.preventDefault();
    let searchTerm = $("#item-input").val();
    console.log(searchTerm);
    callEdaFoodByName(searchTerm);
})

//---------------------------------------------------
//                  set user firebase vars

function updateFirebase(location, value) {

    firebase.database().ref("/users/" + uuid + "/" + location).push(value)
}

//--------------------------------------------------
//                    API Calls
//--------------------------------------------------

//Variables for EDAMAM RECIPE DATABASE
var edaRecId = "e09fb63c";
var edaRecKey = "e3f22d5545ff1c55fcf99f5fb6d19266";

// Variables for EDAMAM FOOD DATABASE
var edaFoodId = "cd666e09";
var edaFoodKey = "13cb0a3f237838bbc1414d50596d2015";
// var barcodeNum = "023700043825"



//Function to call EDAMAM RECIPE DATABASE
function callEdaRec(userFoodItem) {
    var queryURL = "https://api.edamam.com/search?q=" + userFoodItem + "&app_id=" + edaRecId + "&app_key=" + edaRecKey;
    console.log(queryURL);

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {


        var hits = response.hits;

        for (var i = 0; i < hits.length; i++) {

            let newRecipe = createRecipeObject(hits[i].recipe);
            let newHTML = createRecipeHTML(newRecipe);
            //TODO: Display this recipeHTML object in results
        }
    })

}
//Function to search EDAMAM FOOD DATABASE using a passed barcode
function callEdaFood(barcodeNum) {
    var queryURL = "https://api.edamam.com/api/food-database/parser?upc=" + barcodeNum + "&app_id=" + edaFoodId + "&app_key=" + edaFoodKey;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        let newFoodItem = createFoodItemObject(response.hints[0].food);


        addItemToPantry(newFoodItem);

        $("#pantryList").append(createFoodItemHTML(newFoodItem));
    })

}

function callEdaFoodByName(foodName) {
    var queryURL = "https://api.edamam.com/api/food-database/parser?ingr=" + foodName + "&app_id=" + edaFoodId + "&app_key=" + edaFoodKey;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        let newFoodItem = createFoodItemObject(response.hints[0].food);

        addItemToPantry(newFoodItem);

        $("#pantryList").append(createFoodItemHTML(newFoodItem));
    })
}


getAccountInfo();
// updateFirebase();