var map;
var infoWindow;
var bounds;

var center = { lat: 37.402349, lng: -121.927459 }

function initMap()
{
    // Google Maps Styling
    // Takes default values if not all values are given or even empty
    var styles = [

    ];
    
    // Creates Google Maps at the DOM element which has an id map; with
    // Latitude and Longitude for center and Zoom level (0-21) for area.
    map = new google.maps.Map(
        document.getElementById('map'),
        {
            center: center,
            zoom: 13,
            // Optional
            styles: styles,
            // Optional: To disable Map, Satellite buttons, true by default
            mapTypeControl: false
        }
    );
    map.addListener('click', close_infoWindow);

    // Create an infoWindow
    infoWindow = new google.maps.InfoWindow();

    // Create Bounds
    bounds = new google.maps.LatLngBounds();
    
    console.log("Created Google Maps");

    createPlaces();
}

function set_InfoWindow(marker, content)
{
    // To stop setting and opening info window if already open at the same
    // marker
    if(infoWindow.marker != marker)
    {
        // Set infoWindow content and open
        infoWindow.marker = marker;
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
        // To close the infoWindow
        infoWindow.addListener('closeclick', close_infoWindow);
    }
}

function close_infoWindow()
{
    infoWindow.marker = null;
    infoWindow.close();
}
