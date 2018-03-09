var map;
var infoWindow;
var bounds;

var center = { lat: 37.402349, lng: -121.927459 }

function initMap()
{
    // Creates Google Maps at the DOM element which has an id map; with
    // Latitude and Longitude for center and Zoom level (0-21) for area.
    map = new google.maps.Map(
        document.getElementById('map'),
        {
            center: center,
            zoom: 13
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

function set_InfoWindow(marker, content, location)
{
    // To stop setting and opening info window if already open at the same
    // marker
    if(infoWindow.marker != marker)
    {
        // Set infoWindow content and open
        content = '<div id="info-window">' + content;
        content += "<br/>(" + location.lat;
        content += ", " + location.lng + ")</div>"; 
        
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
