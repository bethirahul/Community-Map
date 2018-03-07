function initMap()
{
    console.log("Creating Google Maps");
    // Creates Google Maps at the DOM element with Latitude and Longitude for
    // center and Zoom level (0-21) for area.
    var map = new google.maps.Map(
        document.getElementById('map'),
        {
            center: { lat: 37.402365, lng: -121.9275},
            zoom: 13
        }
    );
    if(map)
        console.dir(map);
    console.log("Created Google Maps");
}