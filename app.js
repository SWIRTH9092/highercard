//  status of deck - deck_id; remaining; and sucess;
const deckStatus = {
    deckID: "new",
    remainingCardsInDeck: 52,
    success: " "
}

let deckID_API = "new"    // default is new for first call
//  Array to hold the number of cards

// variable for base url
const baseURL = 'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1'

//default is New
let deckID = "new"  

const shuffleDraw = `https://deckofcardsapi.com/api/deck/${deckID_API}/draw/?count=9`

// // process Deck Status Data
//     function processDeckStatus (data) {
//         deckStatus.deckID = data.deck_ID
//         deckStatus.remainingCardsInDeck = data.remaining
//         deckStatus.success = data.sucess
//         console.log("deckStatus", deckStatus)
//     }

    // function gets a new deck of cards and draws
function getCardDeck() {
    // make api call
    $.ajax(shuffleDraw)
    .then(
        (drawData) => {
        console.log(drawData)
        // function processDeckStatus(drawData)
        },
        (error) => {
            console.log("error:", error)
        })
} 

    getCardDeck()