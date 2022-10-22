//  status of deck
const gameInfo = {
    deckStatus: {
       deckID: "new",
       remainingCardsInDeck: 52,
       success: " "
    }

}


let deckID_API = "new"    // default is new for first call
//  Array to hold the number of cards

// variable for base url
const baseURL = 'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1'

//default is New
let deckID = "new"  

const shuffleDraw = `https://deckofcardsapi.com/api/deck/${deckID_API}/draw/?count=9`

// process Deck Status Data
function processDeck (data) {
    deckID_API = data.deck_id
    gameInfo.deckStatus.deckID = data.deck_id
    gameInfo.deckStatus.remainingCardsInDeck = data.remaining
    gameInfo.deckStatus.success = data.success
    console.log("gameInfo", gameInfo)
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