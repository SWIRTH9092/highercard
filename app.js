//  Game info stored in one object

const gameInfo = {
        deckStatus: {
        deckID: "new",
        remainingCardsInDeck: 52,
        success: " "
        },
        stats: { 
            gameWins: 0,
            gameLosses: 0,
            gameTies: 0,
        },
        // this is one deck card array for each card drawn
        //    within this array:
        //      0 - card code 
        //      1 - link to card face
        //      2 - suit
        //      3 - value
        //      4 - compare value
        deckCards: [
                    []
                    ],      
}

//work variables
let workIndex;

let deckID_API = "new"    // default is new for first call
//  Array to hold the number of cards

// variable for base url
const baseURL = 'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1'

//default is New
let deckID = "new"  

const shuffleDraw = `https://deckofcardsapi.com/api/deck/${deckID_API}/draw/?count=8`

// process Deck Status Data
function processDeck (data) {
    // save deck id for future API calls....
    deckID_API = data.deck_id
    console.log("before game Info", gameInfo)
    
    // save deck stats
    gameInfo.deckStatus.deckID = data.deck_id
    gameInfo.deckStatus.remainingCardsInDeck = data.remaining
    gameInfo.deckStatus.success = data.success
    
    // save card values
    gameInfo.deckCards = data.cards.map(function (card) {
        let compareValue = 0
        switch (card.value) {
                case "ACE":
                    compareValue = 14;
                    break;
                case "KING":
                    compareValue = 13;
                    break;
                case "QUEEN":
                    compareValue = 12;
                    break;
                case "JACK":
                    compareValue = 11;
                    break;
                default:
                    compareValue = card.value  
                    break;
        }
        return[card.code, card.image, card.suit, card.value, compareValue]
        })
 
    console.log("after game Info", gameInfo) 
}

    // function gets a new deck of cards and draws
function getCardDeck() {
    // make api call
    $.ajax(shuffleDraw)
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