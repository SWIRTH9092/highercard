//  Game info stored in one object

const gameInfo = {
        stats: { 
            gameWins: 0,
            gameLosses: 0,
            gameTies: 0,
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
            
//  Define Jquery  variables

const $nodes = {
    faceShowing: $(".faceshowing"),
    compareShowing: $(".compareshowing"),
    buttonChoice: $(".choice"),
}

// variable for base url
const baseURL = 'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1'

//default is New, first draw is 2
let deckID = "new" 
let drawNo = 2 

const draw = `https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=${drawNo}`

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

    deckID_API = data.deck_id   //next API will draw from the current deck
    drawNo = 1

console.log(data)
  
    // save card values to 2 dimensional table (face card, compare card)
        saveCard(0,data) 
        saveCard(1,data)
        console.log(cardValues)
        renderCard (0, "face")
        renderCard (1, "back")
}   

//-----------------------------------------------------------------------
// process saves card image link and generated compare value
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
            default:
                cardValues[arrPos] [2] = (data.cards [arrPos].value);
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
    console.log("renderCard", cardNo, type)
    if (cardNo === 0) {
        $nodes.faceShowing.attr("src", cardValues [cardNo] [1]) 
    } else if (type === "back") {
        $nodes.compareShowing.attr("src", "/images/cardback.png")       
    } else {
        $nodes.compareShowing.attr("src", cardValues[cardNo] [1])     
    } 
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
    console.log("event target", event.target) 
    console.log("event", event)

    //  verifies this click was for a button
    //  bypass all clicks not for a button
    if ($buttonChoiceEvent.target.nodeName !== 'BUTTON') {
        return
    }
    
    //  Determine which button was clicked: higher, lower or draw
    console.log("innerText", $buttonChoiceEvent.target.innerText)
    switch ($buttonChoiceEvent.target.innerText) {
        case "Higher":
            processHigherButton()
            break;
        case "Lower":
            processLowerButton()
            break;
        case "Draw":
            processDrawButton()
            break;
        default:
            console.log("invalid button found")
            break;
    }

})
//-----------------------------------------------------------------------
// Process Higher Button
//-----------------------------------------------------------------------

function processHigherButton () {
    
    //  was the face card value > compare card value? (guess correct?)
    // if (cardValues[0][2] > cardValues[1][2]) {

    // }
}
  
function processLowerButton () {
    console.log("process lower Button")
}

function processDrawButton () {
    console.log("process draw Button")
}
