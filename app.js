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
//note:
let cardValues = [
    [0, "xxxx", 1],
    [1, "yyyy", 2]
];
            
console.log("Cardvalues", cardValues)


//  Define Jquery  variables

const $nodes = {
    faceShowing: $(".faceshowing"),
    compareShowing: $(".compareshowing")
}

// variable for base url
const baseURL = 'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1'

//default is New, first draw is 2
let deckID = "new" 
let drawNo = 2 

const draw = `https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=${drawNo}`


// save the card values in array
//arrPos - 0 - face card values
//         1 - compare card values
function saveCard(arrPos, data) {

cardValues [arrPos][1] = (data.cards[arrPos].image)

// cardValues [arrPos].push(data.cards[arrPos].value)

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

// process Deck Status Data
function processDeck (data) {
    // save deck id for future API calls....
    deckID_API = data.deck_id
    console.log("before game Info", gameInfo)
    
    // check call stats
    if (data.success !== true) {
        console.log("unsuccesful API call")
        return
    }
    console.log(data)
  
    // save card values
        saveCard(0,data)
        saveCard(1,data)
        console.log(cardValues)
        renderCard (0, "face")
        renderCard (1, "back")
}   

    function renderCard (cardNo, type) {
        console.log("1-you are here", cardNo, type, cardValues)
        if (cardNo === 0) {
            $nodes.faceShowing.attr("src", cardValues [cardNo] [1]) 
        } else if (type === "back") {
            $nodes.compareShowing.attr("src", "/images/cardback.png")       
        } else {
            $nodes.compareShowing.attr("src", cardValues[cardNo] [1])     
        } 
    }

    // function gets a new deck of cards and draws
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

    getCardDeck()
//renderCard(1,"face")