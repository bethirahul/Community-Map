var map;
var infoWindow;

var home_loc = { lat: 37.635667, lng: -122.218386 }

function initMap()
{
    // Creates Google Maps at the DOM element with Latitude and Longitude for
    // center and Zoom level (0-21) for area.
    map = new google.maps.Map(
        document.getElementById('map'),
        {
            center: home_loc,
            zoom: 10
        }
    );

    infoWindow = new google.maps.InfoWindow();
    
    console.log("Created Google Maps");

    createPlaces();
}