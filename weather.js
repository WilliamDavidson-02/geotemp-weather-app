const body = document.querySelector("body");
// Forecast display
const displayLocation = document.getElementById("location");
const displayForecastTitle = document.getElementById("forecast-title");
const displayHighLow = document.getElementById("high-low");
const displayWeatherType = document.getElementById("weather-type");
const forecastHoursContainer = document.getElementById("forecast-hours");
// Wind / compass
const arrow = document.getElementById("arrow");
const wind = document.getElementById("wind");
// Uv index
const uvNum = document.getElementById("uv-num");
const uvDefinition = document.getElementById("uv-definition");
const uvRange = document.getElementById("uvRange");
// Humidity
const humidity = document.getElementById("humidity");
// Feels like
const feelLike = document.getElementById("feelsLike");
// Weather Nav
const navContainer = document.getElementById("nav");
const editBtn = document.getElementById("edit");
const navMain = document.getElementById("nav-main");
const locationInput = document.getElementById("getLocation");
const form = document.querySelector("form");
const menuBar = document.getElementById("menu-bar");
// Add Location btn
const addLocationContainer = document.getElementById("add-location-container");
const cancelBtn = document.getElementById("cancel");
const addBtn = document.getElementById("add");

const key = "b956342d6c624a2da4d124318222512";
let apiUrl = "";

let resultsArray = [];
let hourlyForecastArray = [];
let localArray = [];

let currentHour = 0;
let displayBuilt = false;
let editing = false;
let isToggled = false;
let isScrolling = false;
let currentLocation = "";


function getTimeInHours() {
    currentHour = parseInt(resultsArray.location.localtime.substring(11, 13));
}

function preventRangeSlider() {
    uvRange.addEventListener('mousedown', e => e.preventDefault());
    uvRange.addEventListener('touchstart', e => e.preventDefault());
}

// Build Display and nav locations
async function buildDisplay() {
    current = [];
    forecastHoursContainer.innerHTML = "";
    navContainer.innerHTML = "";
    current = localStorage.getItem("usersLocation");
    current = JSON.parse(current);
    currentLocation = current[0];
    apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${currentLocation}&days=3&api=yes`;
    try {
        const response = await fetch(apiUrl);
        resultsArray = await response.json();
        displayCurrentLocation();
        getNavLinks();
    } catch (error) {

    }
}

async function getNavLinks() {
    localArray = [];
    current = localStorage.getItem("usersLocation");
    current = JSON.parse(current);
    current.forEach(async index => {
        currentLocation = index;        
        apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${currentLocation}&days=3&api=yes`;
        try {
            const response = await fetch(apiUrl);
            resultsArray = await response.json();
            localArray.push(resultsArray)
            if(localArray.length === current.length) {
                createUsersLocations();
            }
        } catch (error) {
            
        }
    })
}

// Locations that are saved in the nav menu
function createUsersLocations() {
    localArray.forEach((element, index) => {
        // Container
        const weatherLocationNav = document.createElement("div");
        weatherLocationNav.classList.add("weather-location-nav");
        // Element Section of grid in container
        const leftTopGrid = document.createElement("div");
        leftTopGrid.classList.add("left-grid-top");
        const h1Location = document.createElement("h1");
        h1Location.classList.add("location-h1");
        h1Location.textContent = localArray[index].location.name;
        const timeSpan = document.createElement("span");
        timeSpan.classList.add("content-info");
        timeSpan.textContent = `${localArray[index].location.localtime.substring(11, 16)}`
        // Element Section of grid in container
        const rightTopGrid = document.createElement("div");
        rightTopGrid.classList.add("right-grid-top");
        const h1Celcius = document.createElement("h1");
        h1Celcius.classList.add("location-h1");
        h1Celcius.textContent = `${Math.floor(localArray[index].current.temp_c)}°`;
        // Element Section of grid in container
        const leftBottomGrid = document.createElement("div");
        leftBottomGrid.classList.add("left-grid-bottom");
        const weatherSpan = document.createElement("span");
        weatherSpan.classList.add("content-info");
        weatherSpan.textContent = localArray[index].current.condition.text;
        // Element Section of grid in container
        const rightBottomGrid = document.createElement("div");
        rightBottomGrid.classList.add("right-grid-bottom");
        const highOrLowSpanNav = document.createElement("span");
        highOrLowSpanNav.classList.add("content-info");
        highOrLowSpanNav.textContent = `H: ${Math.floor(localArray[index].forecast.forecastday[0].day.maxtemp_c)}° L: ${Math.floor(localArray[index].forecast.forecastday[0].day.mintemp_c)}°`;

        // Append
        leftTopGrid.append(h1Location, timeSpan);
        rightTopGrid.appendChild(h1Celcius);
        leftBottomGrid.appendChild(weatherSpan);
        rightBottomGrid.appendChild(highOrLowSpanNav);
        weatherLocationNav.append(leftTopGrid, rightTopGrid, leftBottomGrid, rightBottomGrid)
        navContainer.appendChild(weatherLocationNav);
    });
}

function displayCurrentLocation() {
    createHourlyForecast();
    getExtraWeatherInfo()
    displayLocation.textContent = resultsArray.location.name;
    displayForecastTitle.textContent = `${Math.floor(hourlyForecastArray[0].temp_c)}°`;
    displayHighLow.textContent = `H: ${Math.floor(resultsArray.forecast.forecastday[0].day.maxtemp_c)}° L: ${Math.floor(resultsArray.forecast.forecastday[0].day.mintemp_c)}°`
}

function getExtraWeatherInfo() {
    // Get wind degrees
    arrow.style.transform = "rotate(" + hourlyForecastArray[0].wind_degree + "deg)";
    wind.textContent = `${Math.floor(hourlyForecastArray[0].wind_kph * 0.277)} m/s`
    // Get Uv Index
    uvNum.textContent = resultsArray.current.uv;
    if(resultsArray.current.uv <= 2) {
        uvDefinition.textContent = "Lowest";
    } else if(resultsArray.current.uv > 2 && resultsArray.current.uv <= 5) {
        uvDefinition.textContent = "Moderate";
    } else if(resultsArray.current.uv > 5 && resultsArray.current.uv <= 7) {
        uvDefinition.textContent = "High";
    } else if(resultsArray.current.uv > 7 && resultsArray.current.uv <= 10) {
        uvDefinition.textContent = "Very High";
    } else {
        uvDefinition.textContent = "Extreme";
    }
    uvRange.value = resultsArray.current.uv;
    // Get humidity
    humidity.textContent = `${hourlyForecastArray[0].humidity}%`
    // Get Feels Like temp
    feelLike.textContent = `${hourlyForecastArray[0].feelslike_c}°`
}

// Sorts from current hour of the day to 24h into the next day
function sortArrayOfTime() {
    hourlyForecastArray = [];
    getTimeInHours();
    day1 = resultsArray.forecast.forecastday[0].hour;
    day1 = day1.filter(element => {
        let date = parseInt(element.time.substring(11, 13));
        return date >= currentHour;
    });
    currentHour = 24 - day1.length;
    day2 = resultsArray.forecast.forecastday[1].hour;
    day2 = day2.filter(element => {
        let date = parseInt(element.time.substring(11, 13));
        return date < currentHour;
    });
    hourlyForecastArray.push(day1, day2);
    hourlyForecastArray = hourlyForecastArray.flat();
}   

// Create Hourly Forecast display
function createHourlyForecast() {
    sortArrayOfTime();
    hourlyForecastArray.forEach((index) => {
        const forecastHour = document.createElement("div");
        forecastHour.classList.add("forecast-hour");
        const timeSpan = document.createElement("span");
        timeSpan.textContent = index.time.substring(11, 13);
        const img = document.createElement("img");
        img.src = index.condition.icon;
        const predictionSpan = document.createElement("span");
        if(index.chance_of_rain > 0) {
            predictionSpan.classList.add("predictions");
            predictionSpan.textContent = `${index.chance_of_rain}%`;

        } else {
            predictionSpan.textContent = "";
        }
        const celsiusSpan = document.createElement("span");
        celsiusSpan.textContent = `${Math.floor(index.temp_c)}°`;

        //Append to div
        forecastHour.append(timeSpan, img, predictionSpan, celsiusSpan);
        forecastHoursContainer.appendChild(forecastHour);
    });
}

// Ask/gets user location
navigator.geolocation.getCurrentPosition(function(position) {
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;
    currentLocation = `${latitude}, ${longitude}`;
    apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${currentLocation}&days=3&api=yes`;
    getWeatherInformation();
});

// Fetch from weather api
async function getWeatherInformation() {
    try {
        const response = await fetch(apiUrl);
        resultsArray = await response.json();
        if(!localStorage.getItem("usersLocation")) {
            localStorage.setItem("usersLocation", JSON.stringify([resultsArray.location.name]));
        }
    } catch (error) {
        
    }
}

// Submit location in nav input
async function submitGeoLocation(e) {
    e.preventDefault();
    hourlyForecastArray = [];
    apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${locationInput.value}&days=2&api=yes`;
    try {
        const response = await fetch(apiUrl);
        resultsArray = await response.json();
        forecastHoursContainer.innerHTML = "";
        displayCurrentLocation();
        let checkLocations = localStorage.getItem("usersLocation");
        checkLocations = JSON.parse(checkLocations);
        if(!checkLocations.includes(resultsArray.location.name)) {
            addLocationContainer.classList.remove("hidden");
        }
        toggleNav();
        isToggled = true;
    } catch (error) {
        
    }
    locationInput.value = "";
    locationInput.blur();
}

function addToStorage() {
    addLocationContainer.classList.add("hidden");
    let checkLocations = localStorage.getItem("usersLocation");
    checkLocations = JSON.parse(checkLocations);
    checkLocations.push(resultsArray.location.name)
    localStorage.setItem("usersLocation", JSON.stringify(checkLocations));
    navContainer.innerHTML = "";
    getNavLinks();
}

// Select location in nav and display
async function selectLocation() {
    requestAnimationFrame(() => {
        body.style.backgroundColor = navMain.classList.contains("toggle-menu") ? "black" : "#50667f";
    })
    forecastHoursContainer.innerHTML = "";
    apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${currentLocation}&days=3&api=yes`;
    try {
        const response = await fetch(apiUrl);
        resultsArray = await response.json();
        displayCurrentLocation();
    } catch (error) {

    }
}

function toggleNav() {
    navMain.classList.toggle("toggle-menu");
    requestAnimationFrame(() => {
        body.style.backgroundColor = navMain.classList.contains("toggle-menu") ? "black" : "#50667f";
    })
    navMain.classList.toggle("closed-nav");
    editBtn.classList.toggle("edit")
    body.scrollIntoView({ behavior: "instant", block: "start" });
    navMain.scrollIntoView({ behavior: "instant", block: "start" });
    if(isToggled) {
        cancelLocation();
        isToggled = false;
    }
    if(!navMain.classList.contains("closed-nav")) {
        const getInnerHight = window.innerHeight;
        navMain.style.height = `${getInnerHight}px`;
    } else {
        navMain.style.height = "";
    }
    if(window.innerHeight < 1000) {
                // Adjust the position of the nav based on the current scroll position
    if (navMain.classList.contains("toggle-menu")) {
        navMain.style.top = `${window.pageYOffset + 44}px`;
    } else {
        navMain.style.top = `${window.pageYOffset}px`;
    }
    }
}

function selectOrDeleteLocation(e) {
    if(!editing) {
        currentLocation = e.target.parentElement.firstChild.firstChild.textContent;
        selectLocation();
        navMain.classList.toggle("toggle-menu");
        editBtn.classList.toggle("edit")
        body.scrollIntoView({ behavior: "instant", block: "start" });
    } else {    
        const names = JSON.parse(localStorage.getItem("usersLocation"));
        let deletingLocation = e.target.parentElement.firstChild.firstChild.textContent;
        const filterNames =  names.filter((name) => name !== deletingLocation);
        localStorage.setItem("usersLocation", JSON.stringify(filterNames));
        buildDisplay();
    }
}

function cancelLocation() {
    addLocationContainer.classList.add("hidden");
    buildDisplay();
}

// Event Listeners
form.addEventListener("submit", submitGeoLocation);
menuBar.addEventListener("click", toggleNav);
editBtn.addEventListener("click", () => {
    editBtn.classList.toggle("editing")
    editing = editing !== true ? true : false;
    console.log(editing);
});
cancelBtn.addEventListener("click", cancelLocation);
addBtn.addEventListener("click", addToStorage);

navContainer.addEventListener("click", selectOrDeleteLocation);
navContainer.addEventListener("touchend", () => {
    if(!isScrolling) {
        isScrolling = true;
    } else {
        selectOrDeleteLocation(e);
    }
});

// On load
preventRangeSlider();
if(!displayBuilt) {
    buildDisplay();
    displayBuilt = true
}