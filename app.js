// variable for api key
// const apiKey = "bee3427"

// variable for base url
const baseURL = 'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1'

// function that does movie search
function colorSearch() {
    // constructing url for request
    const url = `${baseURL}`
    
    // make our request
    $.ajax(url)
    .then((color) => {
        console.log(color)
    })


}
    colorSearch()