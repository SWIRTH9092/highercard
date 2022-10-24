//  Game info stored in one object

const gameInfo = {
        stats: { 
            correctGuesses: 0,
            wrongGuesses: 0,
        }
}
//   Card [0] - card displayed
//     0 - array position
//     1 - image link
//     2 - compareValue
//   Card [1] = card face down or face up
//     0 - array position
//     1 - image link
//     2 - compareValue
let cardValues = [
    [0, "xxxx", 1],
    [1, "yyyy", 2]
];

//  define guess Stats
let correctGuesses = 0;
let wrongGuesses = 0;

//  Define Jquery  variables

const $nodes = {
    faceShowing: $(".faceshowing"),
    compareShowing: $(".compareshowing"),
    buttonChoice: $(".choice"),
    messageText: $(".message"),
    statsWrong: $(".wrong"),
    statsCorrect: $(".correct")
}

//default is New, first draw is 2
let deckID = "new" 
let drawNo = 2 
let cardsleftInDeck = 52

let draw = `https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=${drawNo}`
let shuffle = `https://deckofcardsapi.com/api/deck/${deckID}/shuffle`

//-----------------------------------------------------------------------
//    function:  getCardDeck() is executed to get the API data for the 
//               initial window.  This function executes with a default
//               setting of "new" for card deck and draws 2 cards
//-----------------------------------------------------------------------

getCardDeck()


//-----------------------------------------------------------------------
//  executes API call to get the data
//-----------------------------------------------------------------------
function getCardDeck() {
    // make api call
    $.ajax(draw)
    .then(
        (drawData) => {
        console.log(drawData)
        processDeck(drawData)
        },
        (error) => {
            console.log("error:", error)
        })
    return;
} 

//-----------------------------------------------------------------------
// process Deck Data from initial API call
//-----------------------------------------------------------------------
function processDeck (data) {

    // check API call sucess
    if (data.success !== true) {
        console.log("unsuccesful API call")
        return
    }

    //  sets defauls for future calls.  
    //     - Next API will draw from the current deck
    //     - 1 card for will drawn (inital draw from a deck requires 2 cards)

    deckID = data.deck_id   //next API will draw from the current deck
    drawNo = 1
    cardsleftInDeck = data.remaining
    draw = `https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=${drawNo}`
  
    // save card values to 2 dimensional table (face card, compare card)
        saveCard(0,data) 
        saveCard(1,data)
        renderCard (0, "face")
        renderCard (1, "back")
    return;
}   

//-----------------------------------------------------------------------
// process saves card image link and generated compare value for 2 cards drawn
//-----------------------------------------------------------------------
//  save the card values in array
//      arrPos - 0 - face card values
//               1 - compare card values

function saveCard(arrPos, data) {
//  save image link
    cardValues [arrPos][1] = (data.cards[arrPos].image)

// set card compare value
    switch (data.cards[arrPos].value) {
            case "ACE":
                cardValues[arrPos] [2] = (14);
                break;
            case "KING":
                cardValues[arrPos] [2] = (13);
                break;
            case "QUEEN":
                cardValues[arrPos] [2] = (12);
                break;
            case "JACK":
                cardValues[arrPos] [2] = (11);
                break;
            case "10":
                cardValues[arrPos] [2] = (10);
                    break;
            default:
                cardValues[arrPos] [2] = ('0' + data.cards [arrPos].value);
                break;
    }
return;
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
        $nodes.faceShowing.attr("src", cardValues [cardNo] [1]) 
    } else if (type === "back") {
        $nodes.compareShowing.attr("src", "/images/cardback.png")       
    } else {
        $nodes.compareShowing.attr("src", cardValues[cardNo] [1])     
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
    if (cardValues[0][2] > cardValues[1][2]) {
        $nodes.messageText.text("Your guess of 'higher' was incorrect. Try again by  clicking on Draw to continue.")
        wrongGuesses += 1
        updateStatsMessage()

    //  if face card value > compare card value, higher guess was "correct"  
    } else if (cardValues[0][2] < cardValues[1][2]) {
        $nodes.messageText.text("Congratulations.  Your guess of 'higher' was correct.  Click on Draw to continue.")
        correctGuesses += 1
        updateStatsMessage()

    } else {
    //  if face card value = compare card value - 
    //         Neither (higher or lower) was true; no guess penalty       
        $nodes.messageText.text("Neither higher or lower.  Click on Draw to continue.")
    }
    return;
}
//-----------------------------------------------------------------------
// Process Lower Button 
//    -  was the face card value > compare card value? (guess correct?)
//----------------------------------------------------------------------- 
function processLowerButton () {

    //  if face card value < compare card value, lower guess was "correct"
    if (cardValues[0][2] > cardValues[1][2]) {
        $nodes.messageText.text("Congratulations.  Your guess of 'lower' was correct.  Click on Draw to continue.")
        correctGuesses += 1
        updateStatsMessage()

    //  if face card value > compare card value, lower guess was "incorrect"  
    } else if (cardValues[0][2] < cardValues[1][2]) {
        $nodes.messageText.text("Your guess of 'lower' was incorrect. Try again by  clicking on Draw to continue.")
        wrongGuesses += 1
        updateStatsMessage()

    } else {
    //  if face card value = compare card value - 
    //         Neither (higher or lower) was true; no guess penalty       
        $nodes.messageText.text("Neither higher or lower.  Click on Draw to continue.")
    }
    return;
}
//-----------------------------------------------------------------------
// Process Draw Button
//----------------------------------------------------------------------- 
function processDrawButton () {

    // If at end of deck, reshuffle the deck
        // if zero cards remaining in deck, shuffle to get drawn cards back
        //    will use nested API calls to keep in sync...   
        if (cardsleftInDeck === 0) {
            // save deckid in shuffle
            shuffle = `https://deckofcardsapi.com/api/deck/${deckID}/shuffle`
            // make API call to shuffle deck
            $.ajax(shuffle)
             .then(
                 (shuffleData) => {
                    if (shuffleData.success !== true) {
                     console.log("01 - unsuccesful API call for Shuffle")
                     return
                    } else {
                        // execute API call to draw 1 card - preset after initial draw
                        // make api call
                        $.ajax(draw)
                        .then(
                            (drawData) => {
                            processDraw(drawData)
                            return;
                            },
                            (error) => {
                                console.log("02 - error:", error)
                                return;
                            })
                        return;
                    }
                },              
                (error) => {
                    console.log("03 - error:", error)
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
                        console.log("cardsLeftInDeck", cardsleftInDeck)
                        return
                    } else {
                        processDraw(drawData)
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
// process Deck Data from initial API call
//-----------------------------------------------------------------------
function processDraw (data) {

    //  sets defauls for future calls.  
    //     - Next API will draw from the current deck
    //     - 1 card for will drawn (inital draw from a deck requires 2 cards)

    cardsleftInDeck = data.remaining
  
    // save card values to 2 dimensional table (face card, compare card)
        cardValues[0][1] = cardValues[1][1]
        cardValues[0][2] = cardValues[1][2]
        saveCard1Draw(1,data)
        renderCard (0, "face")
        renderCard (1, "back")
        return
}   

//-----------------------------------------------------------------------
// process saves card image link and generated compare value for 1 cards drawn
//-----------------------------------------------------------------------
//  save the card values in array
//      arrPos - 0 - face card values
//               1 - compare card values

function saveCard1Draw(arrPos, data) {
//  save image link
    cardValues [arrPos][1] = (data.cards[0].image)

// set card compare value
    switch (data.cards[0].value) {
            case "ACE":
                cardValues[arrPos] [2] = (14);
                break;
            case "KING":
                cardValues[arrPos] [2] = (13);
                break;
            case "QUEEN":
                cardValues[arrPos] [2] = (12);
                break;
            case "JACK":
                cardValues[arrPos] [2] = (11);
                break;
            case "10":
                cardValues[arrPos] [2] = (10);
                    break;
            default:
                cardValues[arrPos] [2] = ('0' + data.cards [0].value);
                break;
    }
    return
}