// variable for api key
// const apiKey = "bee3427"

// variable for base url
const baseURL = 'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1'

let deckID = "kutpw83xkk0x"

const shuffleDraw = `https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=2`

// function that does movie search
function colorSearch() {
    // constructing url for request
    const url = `${baseURL}`
     

    // make our request
    $.ajax(shuffleDraw)
    .then((color) => {
        console.log(color)
    })


}
    colorSearch()