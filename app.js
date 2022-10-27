//  Game info stored in one object
const hlGameDefaults = {
        deckID: "new",
        drawNo: 2,
        cardsleftInDeck: 50,
        faceCardLink: "",
        faceCardFaceValue: "",
        faceCardCompareValue: "",
        compareCardLink: "",
        compareCardCompareValue: "",
        compareCardFaceValue: "",
        accumCorrectGuesses: 0,
        accumWrongGuesses: 0,
    }

//-----------------------------------------------------------------------
// Retrieve from Local Storage
//-----------------------------------------------------------------------
function loadLocalStorageData () {

        const hlJSON = localStorage.getItem("hlgame")
        // if undefined is false, it is not going to run 
        if (hlJSON) {
            return JSON.parse(hlJSON)
        }
        return hlGameDefaults
}
//-----------------------------------------------------------------------
// Update Stats Messages on page and save to local storage
//-----------------------------------------------------------------------
function updateStatsMessage() {
    $nodes.statsCorrect.text(`Current: Correct Guesses: ${correctGuesses}`)
    $nodes.statsWrong.text(`Current: Incorrect Guesses: ${wrongGuesses}`)
    $nodes.accStatsCorrect.text(`To Date: Correct Guesses: ${hlGame.accumCorrectGuesses}`)
    $nodes.accStatsWrong.text(`To Date: Incorrect Guesses: ${hlGame.accumWrongGuesses}`)
    saveLocalStorageData()
    return
}

const hlGame = loadLocalStorageData()

// current games win-loss stats
let correctGuesses = 0;
let wrongGuesses = 0;

//  Define Jquery  variables
const $nodes = {
    faceShowing: $(".faceshowing"),
    compareShowing: $(".compareshowing"),
    imageChoice: $(".imagechoice"),
    buttonChoice: $(".draw"),
    butset2: $(".butset2"),
    messageText: $(".message"),
    statsWrong: $(".wrong"),
    statsCorrect: $(".correct"),
    accStatsWrong: $(".accwrong"),
    accStatsCorrect: $(".acccorrect")
}

let draw = `https://deckofcardsapi.com/api/deck/${hlGame.deckID}/draw/?count=${hlGame.drawNo}`
let shuffle = `https://deckofcardsapi.com/api/deck/${hlGame.deckID}/shuffle`


//-----------------------------------------------------------------------
//  Uses Data from Local Storage - if it exists
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
    if (hlGame.cardsleftInDeck < 10) {
        //   if no cards left in deck
        //       on restart - draw to get a new deck automatically

        //  reset deckID and drawNo to defaults for new deck and save the updated draw API call
        hlGame.deckID = "new"
        hlGame.drawNo = 2
        draw = `https://deckofcardsapi.com/api/deck/${hlGame.deckID}/draw/?count=${hlGame.drawNo}`
        console.log("draw API", draw)
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
                        console.log("Api call - draw", draw)
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
//  add event listener for images
//-----------------------------------------------------------------------
function processDeck (data) {

//-----------------------------------------------------------------------
// add event Listener for images
//   1 - face card -  Is face card higher than the compare card?
//   2 - compare card - Is compare card higher than the face card?
//-----------------------------------------------------------------------

$nodes.imageChoice.on ("click", (event) => {
    // stops the screen from refreshing
    event.preventDefault()
    processImageEventListener(event)
    $nodes.imageChoice.unbind()
 })

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
     return;
   
}   

//-----------------------------------------------------------------------
// Save card info - put in an Object that will be saved to local
//    Storage
//-----------------------------------------------------------------------
//  Call paramaters
//      data - event data from API call 
//      drawNo - Number of cards drawn (draw 2 only happens at beginning
//             of the game and if either no local storage or deck no longer
//             exists)   
function saveCard(data, drawNo) {
//  save image link and genereate
      if (drawNo === 2) {
       // if draw 2, save face card and compare card from API Event data
       hlGame.faceCardLink = data.cards[0].image;
       hlGame.faceCardCompareValue = generateCompareValue (data.cards[0].value);
       hlGame.faceCardfaceValue = (data.cards[0].value);
       hlGame.compareCardLink = data.cards[1].image;
       hlGame.compareCardCompareValue = generateCompareValue (data.cards[1].value);
       hlGame.faceCardfaceValue = (data.cards[1].value);
    }  else {
       // draw 1, move compare card information to face card and save new compare card info from
       //     from API event data
       hlGame.faceCardLink = hlGame.compareCardLink;
       hlGame.faceCardCompareValue = hlGame.compareCardCompareValue;
       hlGame.faceCardFaceValue = hlGame.compareCardFaceValue;
       hlGame.compareCardLink = data.cards[0].image;
       hlGame.compareCardCompareValue = generateCompareValue (data.cards[0].value);
       hlGame.compareCardFaceValue = (data.cards[0].value);
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
//          0 - face card 
//          1 - compare card 
//      2 )  type
//          - "face" - display the card face  (card 0 always displays the face)
//          - "back" - display an image of the back of the card (card 1 
//            can display either the front or back)
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
// event Listener for draw button - draws the next card
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
    processDrawButton()

})

//-----------------------------------------------------------------------
// Process Draw Button
//----------------------------------------------------------------------- 
function processDrawButton () {

    // reset image borders on card selected
    resetImageBorders() 
    //turn off event listner for images


    // If at end of deck, reshuffle the deck
        // if zero cards remaining in deck, shuffle to get drawn cards back
        //    will use nested API calls to keep in sync...   
        if (hlGame.cardsleftInDeck < 10) {
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
                            setButtonVisibility(false)
                            drawMessage ()
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
                        setButtonVisibility(false)
                        drawMessage ()
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
// Update Stats Messages on page and save to local storage
//-----------------------------------------------------------------------

function updateStatsMessage() {
    $nodes.statsCorrect.text(`Current: Correct Guesses: ${correctGuesses}`)
    $nodes.statsWrong.text(`Current: Incorrect Guesses: ${wrongGuesses}`)
    $nodes.accStatsCorrect.text(`To Date: Correct Guesses: ${hlGame.accumCorrectGuesses}`)
    $nodes.accStatsWrong.text(`To Date: Incorrect Guesses: ${hlGame.accumWrongGuesses}`)
    saveLocalStorageData()
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
// Process if draw 
//    -  paramater: visible
//       - true to show button
//       - false to hide button    
//----------------------------------------------------------------------- 
function setButtonVisibility (visible) {

    if (visible) { $nodes.butset2.css("visibility", "visible")}
        else {$nodes.butset2.css("visibility", "hidden")}
}

//-----------------------------------------------------------------------
// Update the message on screen to click on the higher or lower button
//----------------------------------------------------------------------- 

function drawMessage () {
    $nodes.messageText.text("Click on the Card Image to chose the Higher Card. Ace's are the highest card!")
}


//-----------------------------------------------------------------------
// Process listsener for images
//    Passed Paramater:  event information
//    two possible images selected
//       1 - face card -  Is face card higher than the compare card?
//       2 - compare card - Is compare card higher than the face card?
//-----------------------------------------------------------------------

function processImageEventListener(event){
//  create jquery object for event
    $imageChoiceEvent = event

    // vertifies that an image was clicked
   
    if (event.target.nodeName !== 'IMG') {
        return
    }
    // render face down card and process click
    renderCard (1, "face")

    //  Which card was clicked the face showing card or the compare card?
    if (event.target.className === "faceshowing play imagechoice") {
        // Face showing card was selected
        processFaceCardClicked("face")
    } else {
        // compare showing card was selected
        processFaceCardClicked("compare")
    }

}

//-----------------------------------------------------------------------
// Process the Card which was selected
//    Passed Paramater:  cardChosen
//           - "face"  if the face card was chosen higher
//           - "compare" if the face down card was chosen higher
//----------------------------------------------------------------------- 

function processFaceCardClicked (cardChosen) {
    let higherValueChosen, higherValueFaceValue,
    lowerValueChosen, lowerValueFaceValue;
    if (cardChosen === 'face') {
        higherValueChosen = hlGame.faceCardCompareValue;
        higherValueFaceValue = hlGame.faceCardFaceValue;
        $nodes.faceShowing.css("border", "5px solid #083445")
        lowerValueChosen =  hlGame.compareCardCompareValue; 
        lowerValueFaceValue = hlGame.compareCardFaceValue;
        }
    else { 
        higherValueChosen = hlGame.compareCardCompareValue;
        higherValueFaceValue = hlGame.compareCardFaceValue;
        $nodes.compareShowing.css("border", "5px solid #083445")
        lowerValueChosen =  hlGame.faceCardCompareValue; 
        lowerValueFaceValue = hlGame.faceCardFaceValue;
    }
   
    //  if higher card value > lower card value, higher guess was "correct"
    if (higherValueChosen > lowerValueChosen) {
        $nodes.messageText.text(`You guessed the correct higher card!  Click on Draw to continue.`)
        correctGuesses += 1
        hlGame.accumCorrectGuesses += 1
        updateStatsMessage() 

    //  if higher card value < lower card value, higher guess was "correct"  
    } else if (higherValueChosen < lowerValueChosen) {
        $nodes.messageText.text(`You did not guess the correct higher card. Try again by clicking on Draw to continue.`)
        wrongGuesses += 1
        hlGame.accumWrongGuesses += 1
        updateStatsMessage()
    } else {
    //  if higher card value = lower card value - 
    //         Neither (higher or lower) was true; no guess penalty       
        $nodes.messageText.text(`Both cards are ${higherValueFaceValue}'s so neither card was higher.  Click on Draw to continue.`)
    }
    
    //  make higher lower buttons invisible and make draw button
    //   visible
    setButtonVisibility(true)
    //-----------------------------------------------------------------------
    // set event handlers for images off
    //-----------------------------------------------------------------------
    // $nodes.imageChoice.off() 
    return;
}
//-----------------------------------------------------------------------
// reset image borders so that no card is selected
//----------------------------------------------------------------------- 

function resetImageBorders() {
    $nodes.faceShowing.css("border", "5px solid #D4EDF7")
    $nodes.compareShowing.css("border", "5px solid #D4EDF7")  
}

//-----------------------------------------------------------------------
//    functions:     
//               - UpdateStatsMessage is to load stats from local storage 
//               - getInitialCardDeck() is executed to get the API data
//                 for the initial window.  This function executes with
//                 a default setting of "new" for card deck and draws 2 
//                 cards
//-----------------------------------------------------------------------

updateStatsMessage()
getInitialCardDeck()