`use strict`

/* 
document.addEventListener('DOMContentLoaded', function () {
    fetch()
        .then(function () {
            return response.json();
        })
        .then(function (data) {
            return data;
        })
        .catch(function (error) {
            console.error("ERROR: ", error);
            return error;
        })

}); */

//Style the Personality Quiz input selections

const inputs = document.querySelectorAll('input');
const showMeButton = document.getElementById('showMe');
const quizResults = document.getElementById('quizResults');
const dogContainer = document.getElementById('dogImage');
const adoptBtn = document.getElementById('adoptBtn');

//Fetch Dog Image by quiz results
const generateDogImage = (imageUrl) => {
    const dogImage = document.createElement(`img`);
    const clearImage = document.querySelector(`img`);
    clearImage.remove();
    dogImage.setAttribute(`src`, imageUrl);
    dogContainer.append(dogImage);
}

const fetchDogImage = async (breedId) => {
    const BASE_API_URL = `https://dog.ceo/api/breed/`;
    const data = await fetch(BASE_API_URL + breedId + '/images/random').then((data) => data.json());
    generateDogImage(data.message);
}

function showLocalBreeds() {
    const breed = localStorage.getItem('breed');
        
    if (dogContainer.firstChild) {
         dogContainer.removeChild(dogContainer.firstChild); 
    };     

    // gets geolocation data in the form of Lat/Longs
    function getPos() {
        navigator.geolocation.getCurrentPosition(success);
    };
    function success(pos) {
        let position = pos.coords;

        fetch("https://api.petfinder.com/v2/oauth2/token", {
            body: "grant_type=client_credentials&client_id=GykKUK32gXAi6ZW7vjvuASjLEYEIgnlR2zEnwcmOkRLtScO8qe&client_secret=NkKcXUHK3ecDvYSYSEgNcArjwkFh9JbU57EbZr7G",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            method: "POST"
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            //console.log('token ', data);
            return fetch(`https://api.petfinder.com/v2/animals?type=dog&location=${position.latitude},${position.longitude}&distance=200&breed=${breed}`, {
                //second fetch request uses access token get API data
                headers: {
                    Authorization: data.token_type + " " + data.access_token,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
        }).then(function (response) {
            // Return the API response as JSON
            return response.json();
        }).then(function (data) {
            // Log the pet data
            //console.log(data.pagination)
            return data.animals;
        }).then(function (animals) {
            //console.log(animals);
            findRescues(animals);
        }).catch(function (error) {
            console.error("ERROR: ", error);
            return error;
        });
    }

    getPos(); 

};


function showResults() {
    const resultsArray = [];

    //Gets input values on quiz
    for (i = 0; i < inputs.length; i++) {
        if (inputs[i].type = "radio") {
            if (inputs[i].checked)
                resultsArray[i] = inputs[i].value;
        };

    };

    //filters resultsArray to remove empty radio selections
    const answeredArray = resultsArray.filter(function () { return true });
    const newUser = createUser(answeredArray);

    //Finds Exact Matches between user inputs and Dog Traits
    let exactMatch = Dogs.find(exactMatch => exactMatch.traitValue1 === answeredArray[0] &&
        exactMatch.traitValue2 === answeredArray[1] &&
        exactMatch.traitValue3 === answeredArray[2] &&
        exactMatch.traitValue4 === answeredArray[3] &&
        exactMatch.traitValue5 === answeredArray[4]);

    //Finds closest Matches if an exact Match isn't found
    function compareResults() {
        let possibleMatch = [];
        for (let i = 0; i < Dogs.length; i++) {
            if (Dogs[i].traitValue1 === answeredArray[0]) {
                possibleMatch.push(Dogs[i]);
            }
        }
        for (let i = 0; i < Dogs.length; i++) {
            if (Dogs[i].traitValue2 === answeredArray[1]) {
                possibleMatch.push(Dogs[i]);
            }
        }
        for (let i = 0; i < Dogs.length; i++) {
            if (Dogs[i].traitValue3 === answeredArray[2]) {
                possibleMatch.push(Dogs[i]);
            }
        }
        for (let i = 0; i < Dogs.length; i++) {
            if (Dogs[i].traitValue4 === answeredArray[3]) {
                possibleMatch.push(Dogs[i]);
            }
        }
        for (let i = 0; i < Dogs.length; i++) {
            if (Dogs[i].traitValue5 === answeredArray[4]) {
                possibleMatch.push(Dogs[i]);
            }
        }
        console.log("Possible Matches: ", possibleMatch);
        function mode(arr) {
            return arr.sort((a, b) =>
                arr.filter(v => v === a).length
                - arr.filter(v => v === b).length
            ).pop();
        }
        let bestMatch = mode(possibleMatch);
        console.log("Best Match: " + bestMatch.breed);
        return bestMatch;
    }


    //shows comparison match if True, else shows closest match
    function showMatch() {
        const breedBtn = document.createElement('button');
        const resultTxt = document.createElement('h3');

        if (Boolean(exactMatch)) {
            let matchBreed = exactMatch.breed;
            localStorage.setItem('breed', matchBreed);
            console.log("Exact Match: ", matchBreed);
            resultTxt.innerText = "Your match is: " + matchBreed;
            breedBtn.setAttribute("id", "adoptBtn");
            breedBtn.innerText = exactMatch.breed + "s in your area";
            breedBtn.addEventListener('click', function () {

           
                showLocalBreeds();
            });
            quizResults.appendChild(resultTxt);
            quizResults.appendChild(breedBtn);
            fetchDogImage(exactMatch.breedId);
            return exactMatch;
        } else {
            let closestMatch = compareResults();
            localStorage.setItem('breed', closestMatch.breed);
            resultTxt.innerText = "Your match is: " + closestMatch.breed;
            breedBtn.setAttribute("id", "adoptBtn");
            breedBtn.innerText = closestMatch.breed + "s in your area";
            breedBtn.addEventListener('click', function () {
                showLocalBreeds();
            });
            quizResults.appendChild(resultTxt);
            quizResults.appendChild(breedBtn);
            fetchDogImage(closestMatch.breedId);
            return;
        };
    };


    showMatch();
};


//creates User and fills it will the answeredArray
function createUser(answeredArray) {
    const newUser = new User(answeredArray)
    return newUser;
};

function findRescues(animals) {
    const dogs = animals;

    if (dogs == null) {
        dogContainer.innerText = "There are no rescues of that breed in your area."
    } else {
        let dogList = document.createElement('ul');
        dogs.forEach(function (element) {
            let adoptCard = document.createElement('li');
            let nameLi = document.createElement('li');
            let detailsLi = document.createElement('li');
            let imageLi = document.createElement('img');
            let linkEl = document.createElement('a');
    
            imageLi.src = element.primary_photo_cropped.small;
            linkEl.setAttribute('href', element.url);
            linkEl.innerText = "Click to See Profile";
    
            nameLi.innerText = `${element.name}`;
            detailsLi.innerText = `${element.breeds.primary}, Size: ${element.size}`;
    

    
            adoptCard.appendChild(nameLi);
            adoptCard.appendChild(imageLi);
            adoptCard.appendChild(detailsLi);
            adoptCard.appendChild(linkEl);
            adoptCard.className = 'adoptCard';
    
            dogList.appendChild(adoptCard);
            dogContainer.appendChild(dogList);
    
        });
    };
};



showMeButton.addEventListener('click', function () {
    //styles form answers based on user's inputs
    inputs.forEach(function (input) {
        if (input.checked) {
            input.parentNode.style.color = "green";
        } else {
            //console.log("THIS IS NOT CHECKED")
            input.parentNode.style.color = "red";
        }
    });
    while (quizResults.firstChild) {
        quizResults.removeChild(quizResults.firstChild);
        dogContainer.removeChild(dogContainer.firstChild);
   }; 

    showResults();
});

//Define Dog Breed Classes
let Dogs = [{
    "breed": "Jack Russell Terrier",
    "traitValue1": "3",
    "traitValue2": "3",
    "traitValue3": "5",
    "traitValue4": "2",
    "traitValue5": "4",
    "breedId": "terrier/russell",
},
{
    "breed": "French Bulldog",
    "traitValue1": "2",
    "traitValue2": "2",
    "traitValue3": "5",
    "traitValue4": "2",
    "traitValue5": "5",
    "breedId": "bulldog/french",
},
{
    "breed": "Great Dane",
    "traitValue1": "2",
    "traitValue2": "4",
    "traitValue3": "2",
    "traitValue4": "4",
    "traitValue5": "3",
    "breedId": "dane/great",
},
{
    "breed": "Chihuahua",
    "traitValue1": "1",
    "traitValue2": "5",
    "traitValue3": "1",
    "traitValue4": "4",
    "traitValue5": "5",
    "breedId": "chihuahua",
},
{
    "breed": "German Shepherd",
    "traitValue1": "5",
    "traitValue2": "1",
    "traitValue3": "5",
    "traitValue4": "5",
    "traitValue5": "5",
    "breedId": "germanshepherd",
},
    /* {
        "breed": "",
        "traitValue1": "",
        "traitValue2": "",
        "traitValue3": "",
        "traitValue4": "",
        "traitValue5": "",
    }, */
]


class User {
    traitvalues = []

    constructor(traitvalues) {
        this.traitvalues = traitvalues;
    }
};

