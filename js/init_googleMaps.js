var map;

var home_loc = { lat: 37.402365, lng: -121.9275 }

function initMap()
{
    // Creates Google Maps at the DOM element with Latitude and Longitude for
    // center and Zoom level (0-21) for area.
    map = new google.maps.Map(
        document.getElementById('map'),
        {
            center: home_loc,
            zoom: 13
        }
    );
    console.log("Created Google Maps");

    createPlaces();
}