//  Game info stored in one object
const hlGameDefaults = {
    
        deckID: "new",
        drawNo: 2,
        cardsleftInDeck: 50,
        faceCardLink: "",
        faceCardCompareValue: "",
        compareCardLink: "",
        compareCardCompareValue: "",
        accumCorrectGuesses: 0,
        accumWrongGuesses: 0,
    }

//-----------------------------------------------------------------------
// Retrieve from Local Storage
//-----------------------------------------------------------------------

function loadLocalStorageData () {

        const hlJSON = localStorage.getItem("hlgame")
        // console.log("hlJSON", hlJSON)
        // if undefined is false, it is not going to run 
        if (hlJSON) {
            return JSON.parse(hlJSON)
        }
        return hlGameDefaults
}

const hlGame = loadLocalStorageData()

// current games win-loss stats
let correctGuesses = 0;
let wrongGuesses = 0;

//  Define Jquery  variables
const $nodes = {
    faceShowing: $(".faceshowing"),
    compareShowing: $(".compareshowing"),
    buttonChoice: $(".choice"),
    butset1: $(".butset1"),
    butset2: $(".butset2"),
    messageText: $(".message"),
    statsWrong: $(".wrong"),
    statsCorrect: $(".correct")
}

//default is New, first draw is 2
let drawNo = 2 
let cardsleftInDeck = 52

let draw = `https://deckofcardsapi.com/api/deck/${hlGame.deckID}/draw/?count=${hlGame.drawNo}`
let shuffle = `https://deckofcardsapi.com/api/deck/${hlGame.deckID}/shuffle`


//-----------------------------------------------------------------------
//    function:  getInitialCardDeck() is executed to get the API data for the 
//               initial window.  This function executes with a default
//               setting of "new" for card deck and draws 2 cards
//-----------------------------------------------------------------------

getInitialCardDeck()


//-----------------------------------------------------------------------
//  loads Data from Local Storage - if it exists
// executes API call to get the data
//   - checks for end of deck 
//     - can occur if card remaining = 0 at end of previous game
//     - can occur if card remaining = 0 in current game
//  - shuffle deck will fail if card deck no longer exists
//    - card decks are deleted after two weeks
//    
//-----------------------------------------------------------------------
function getInitialCardDeck() {

    // if zero cards remaining in deck, shuffle to get drawn cards back
    //    will use nested API calls to keep in sync...   
    if (hlGame.cardsleftInDeck === 0) {
        //   if no cards left in deck
        //       on restart - draw to get a new deck automatically

        //  reset deckID and drawNo to defaults for new deck and save the updated draw API call
        hlGame.deckID = "new"
        hlGame.drawNo = 2
        draw = `https://deckofcardsapi.com/api/deck/${hlGame.deckID}/draw/?count=${hlGame.drawNo}`
    
        // API call for new deck - draw 2
        $.ajax(draw)
            .then(
                (drawData) => {
                    // check for draw success - failure will only occur if website is not available
                    if (drawData.success !== true){
                        $nodes.messageText.text("01 - API call website unavailable, please try again later.")
                        console.log("01 - error", drawData)
                        return;
                    } else { 
                        // call was successful so process the deck for the window
                        processDeck(drawData);
                    }
                },
                (error) => {
                     // failure should only occur if website is not available
                    $nodes.messageText.text("02 - API call website unavailable, please try again later.")
                    console.log("02 - error:", error)
                    return;
                })
    } else {
        // execute API - decked and drawNo taken from JSON file load
        // make api call
        draw = `https://deckofcardsapi.com/api/deck/${hlGame.deckID}/draw/?count=${hlGame.drawNo}`
        // make api call        
        $.ajax(draw)
                .then(
                (drawData) => {
                    // failure should only occur if website is not available
                    if (drawData.success !== true){
                        $nodes.messageText.text("03 - API call website unavailable, please try again later.");
                        console.log("03 - error", drawData);
                        return;
                    } else { 
                        // call was successful so process the deck for the window
                        processDeck(drawData); 
                    }
                    },
                (error) => {
                    // failure should only occur if website is not available
                    $nodes.messageText.text("04 - API call website unavailable, please try again later.");
                    console.log("04 - error", drawData);
                    return;
                })
        }
    } 
//-----------------------------------------------------------------------
// process Deck Data from initial API call
//-----------------------------------------------------------------------
function processDeck (data) {

    // save card values
    saveCard(data, hlGame.drawNo)
    renderCard (0, "face")
    renderCard (1, "back")

    //  sets defauls for future calls.  
    //     - Next API will draw from the current deck
    //     - 1 card for will drawn (inital draw from a deck requires 2 cards)
    hlGame.deckID = data.deck_id   //next API will draw from the current deck
    hlGame.drawNo = 1
    hlGame.cardsleftInDeck = data.remaining
    draw = `https://deckofcardsapi.com/api/deck/${hlGame.deckID}/draw/?count=${hlGame.drawNo}`
    saveLocalStorageData()
    return;
}   

//-----------------------------------------------------------------------
// Save card info - put in Object for Json
//-----------------------------------------------------------------------
//  Call paramaters
//      data - event data from API call
//      drawNo - Number of cards drawn     
function saveCard(data, drawNo) {
//  save image link and genereate
      if (drawNo === 2) {
       // if draw 2, save face card and compare card from API Event data
       hlGame.faceCardLink = data.cards[0].image;
       hlGame.faceCardCompareValue = generateCompareValue (data.cards[0].value);
       hlGame.compareCardLink = data.cards[1].image;
       hlGame.compareCardCompareValue = generateCompareValue (data.cards[1].value);
    }  else {
       // draw 1, move compare card information to face card and save new compare card info from
       //     from API event data
       hlGame.faceCardLink = hlGame.compareCardLink;
       hlGame.faceCardCompareValue = hlGame.compareCardCompareValue;
       hlGame.compareCardLink = data.cards[0].image;
       hlGame.compareCardCompareValue = generateCompareValue (data.cards[0].value);
    }
    return 0
}
//-----------------------------------------------------------------------
// generate Compare Value
//-----------------------------------------------------------------------
//  Call paramaters
//     card value to generate the compare value for
 function generateCompareValue(cardValue) {
// set card compare value
    switch (cardValue) {
            case "ACE":
                return '14';
                break;
            case "KING":
                return '13';
                break;
            case "QUEEN":
                return '12';
                break;
            case "JACK":
                return '11';
                break;
            case "10":
                return '10';
                    break;
            default:
                return ('0' + cardValue.toString());
                break;
    }
}

//-----------------------------------------------------------------------
// loads card data to screen
//    2 input paramaters: 
//      1 - card no
//          0 - face card (array number 0 in cardValues array)
//          1 - compare card (array number 1 in cardValues array
//      2 )  type
//          - "face" - display the card face  (card 0 always displayed the face)
//          - "back" - display an image of the back of the card (card 1 can display
//                     either the front or back)
//-----------------------------------------------------------------------
function renderCard (cardNo, type) {
    if (cardNo === 0) {
        $nodes.faceShowing.attr("src", hlGame.faceCardLink) 
    } else if (type === "back") {
        $nodes.compareShowing.attr("src", "/images/cardback.png")       
    } else {
        $nodes.compareShowing.attr("src", hlGame.compareCardLink)     
    } 
    return;  
}
     
//-----------------------------------------------------------------------
// event Listener for buttons
//   1 - higher button -  will compare face card to compare card to see 
//       if face card is higher
//   2 - lower button - will compare face card to compare card to see 
//       if face card is lower
//   3 - draw button - draws next card
//-----------------------------------------------------------------------


$nodes.buttonChoice.on ("click", (event) => {

    // stops the screen from refreshing
    event.preventDefault()

    //  create jquery object for event
    $buttonChoiceEvent = event

    //  verifies this click was for a button
    //  bypass all clicks not for a button
    if ($buttonChoiceEvent.target.nodeName !== 'BUTTON') {
        return
    }
    
    //  Determine which button was clicked: higher, lower or draw
    switch ($buttonChoiceEvent.target.innerText) {
        case "Higher":
            renderCard (1, "face")
            processHigherButton()
            break;
        case "Lower":
            renderCard (1, "face")
            processLowerButton()
            break;
        case "Draw":
            processDrawButton()
            break;
        default:
            console.log("invalid button found")
            break;
    }
    return;
})
//-----------------------------------------------------------------------
// Process Higher Button 
//    -  was the face card value > compare card value? (guess correct?)
//-----------------------------------------------------------------------

function processHigherButton () {
    
    //  if face card value < compare card value, higher guess was "wrong"
    if (hlGame.faceCardCompareValue > hlGame.compareCardCompareValue) {
        $nodes.messageText.text("Your guess of 'higher' was incorrect. Try again by  clicking on Draw to continue.")
        wrongGuesses += 1
        hlGame.accumWrongGuesses += 1
        updateStatsMessage() 

    //  if face card value > compare card value, higher guess was "correct"  
    } else if (hlGame.faceCardCompareValue < hlGame.compareCardCompareValue) {
        $nodes.messageText.text("Congratulations.  Your guess of 'higher' was correct.  Click on Draw to continue.")
        correctGuesses += 1
        hlGame.accumCorrectGuesses += 1
        updateStatsMessage()
    } else {
    //  if face card value = compare card value - 
    //         Neither (higher or lower) was true; no guess penalty       
        $nodes.messageText.text("Neither higher or lower.  Click on Draw to continue.")
    }
    
    //  make higher lower buttons invisible and make draw button
    //   visible
    setButtonVisibility("dvis")
    return;
}
//-----------------------------------------------------------------------
// Process Lower Button 
//    -  was the face card value > compare card value? (guess correct?)
//----------------------------------------------------------------------- 
function processLowerButton () {

    //  if face card value < compare card value, lower guess was "correct"
    if (hlGame.faceCardCompareValue  > hlGame.compareCardCompareValue) {
        $nodes.messageText.text("Congratulations.  Your guess of 'lower' was correct.  Click on Draw to continue.")
        correctGuesses += 1
        hlGame.accumCorrectGuesses += 1
        updateStatsMessage()

    //  if face card value > compare card value, lower guess was "incorrect"  
    } else if (hlGame.faceCardCompareValue  < hlGame.compareCardCompareValue) {
        $nodes.messageText.text("Your guess of 'lower' was incorrect. Try again by  clicking on Draw to continue.")
        wrongGuesses += 1
        hlGame.accumWrongGuesses += 1
        updateStatsMessage()

    } else {
    //  if face card value = compare card value - 
    //         Neither (higher or lower) was true; no guess penalty       
        $nodes.messageText.text("Neither higher or lower.  Click on Draw to continue.")
    }
    //  make higher lower buttons invisible and make draw button
    //   visible
    setButtonVisibility("dvis")
    return;
}
//-----------------------------------------------------------------------
// Process Draw Button
//----------------------------------------------------------------------- 
function processDrawButton () {

    // If at end of deck, reshuffle the deck
        // if zero cards remaining in deck, shuffle to get drawn cards back
        //    will use nested API calls to keep in sync...   
        if (hlGame.cardsleftInDeck === 0) {
            // save deckid in shuffle
            shuffle = `https://deckofcardsapi.com/api/deck/${hlGame.deckID}/shuffle`
            // make API call to shuffle deck
            $.ajax(shuffle)
             .then(
                 (shuffleData) => {
                    if (shuffleData.success !== true) {
                     console.log("05 - unsuccesful API call for Shuffle", shuffleData)
                     console.log("apishuffle call", shuffle)
                     return;
                    } else {
                        // execute API call to draw 1 card - preset after initial draw
                        // make api call
                        $.ajax(draw)
                        .then(
                            (drawData) => {    
                        // successful API call
                        //  execute ProcessDeck to load the data to the screen
                        //  Change button Visiability for Higher & lower to be visiable
                            processDeck(drawData)
                            setButtonVisibility("hlvis")
                            return;
                            },
                            (error) => {
                                console.log("06 - error:", error)
                                return;
                            })
                        return;
                    }
                },              
                (error) => {
                    console.log("07 - error:", error)
                    return
                })
         } 
         else {
            // Remaing cards left > 0
            //     execute API call to draw 1 card - preset after initial draw
            //     make api call
            $.ajax(draw)
            .then(
                (drawData) => {
                        // check API call sucess
                     if (drawData.success !== true) {
                        console.log("unsuccesful API call")
                        console.log("11-drawData",drawData)
                        return
                    } else {
                        // successful API call
                        //  execute ProcessDeck to load the data to the screen
                        //  Change button Visiability for Higher & lower to be visiable
                        processDeck(drawData)
                        setButtonVisibility("hlvis")
                        return;
                    }      
                },
                (error) => {
                    console.log("04 - error:", error)
                    return;
                })
            return;
        }
    return;
}


//-----------------------------------------------------------------------
// Update Stats Messages
//-----------------------------------------------------------------------

function updateStatsMessage() {
    $nodes.statsCorrect.text(`Correct Guesses: ${correctGuesses}`)
    $nodes.statsWrong.text(`Wrong Guesses: ${wrongGuesses}`)
    return
}

//-----------------------------------------------------------------------
// Save Game info to local Storage
//-----------------------------------------------------------------------
function saveLocalStorageData () {
    const hlJSON = JSON.stringify(hlGame);
    localStorage.setItem("hlgame", hlJSON)
}
  
//-----------------------------------------------------------------------
// Process buttons sets
//    -  either buttons:  "higher and lower" should be visbile 
//                        or "draw" should be visible. Both 
//                        should not be visable at the same time
//       values for visible:  hlvis or dvis
//----------------------------------------------------------------------- 

function setButtonVisibility (visible) {

if (visible === "hlvis") {
    $nodes.butset1.css("visibility", "visible")
    $nodes.butset2.css("visibility", "hidden")
} else if (visible === "dvis") {
    $nodes.butset1.css("visibility", "hidden")
    $nodes.butset2.css("visibility", "visible")
}  else {console.log(`invalid value: ${visible} coded for setButtonVisibility`)}
}