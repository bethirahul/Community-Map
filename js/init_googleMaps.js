function make_url(url, parameters)
{
    url += '?';
    for(key in parameters)
    {
        value = parameters[key];
        url += key + '=' + value;
        url += '&';
    }

    return url;
}

(function()
{
    var url = "https://maps.googleapis.com/maps/api/js";
    var parameters = {
        'key': 'AIzaSyCxJAircwo3jIDVpKa2WCDz86mdtX-YOng',
        'callback': 'initMap'
    };

    url = make_url(url, parameters);

    var body = document.getElementsByTagName('body')[0];
    var theScript = document.createElement('script');
    theScript.type = 'text/javascript';
    theScript.src = url;
    theScript.async = true;
    theScript.defer = true;
    body.appendChild(theScript);
})();

//==============================================================================

var map;
var infoWindow;
var bounds;
var default_marker_icon;
var hover_marker_icon;
var selected_marker_icon;

var center = { lat: 37.402349, lng: -121.927459 }

function initMap()
{
    // Google Maps Styling
    // Takes default values if not all values are given or even empty
    var my_styledMapType = new google.maps.StyledMapType(
        [
            {
                elementType: 'geometry',
                stylers: [{color: '#eaeaea'}]
            },
            {
                elementType: 'labels.text.fill',
                stylers: [{color: '#00225b'}]
            },
            {
                elementType: 'labels.text.stroke',
                stylers: [{color: '#edf4ff'}]
            },
            {
                featureType: 'administrative',
                elementType: 'geometry.stroke',
                stylers: [{color: '#c9b2a6'}]
            },
            {
                featureType: 'administrative.land_parcel',
                elementType: 'geometry.stroke',
                stylers: [{color: '#ffb7b7'}]
            },
            {
                featureType: 'administrative.land_parcel',
                elementType: 'labels.text.fill',
                stylers: [{color: '#6b6968'}]
            },
            {
                featureType: 'landscape.natural',
                elementType: 'geometry',
                stylers: [{color: '#d3e0b1'}]
            },
            {
                featureType: 'poi',
                elementType: 'geometry',
                stylers: [{color: '#cbce82'}]
            },
            {
                featureType: 'poi',
                elementType: 'labels.text.fill',
                stylers: [{color: '#665854'}]
            },
            {
                featureType: 'poi.park',
                elementType: 'geometry.fill',
                stylers: [{color: '#83c483'}]
            },
            {
                featureType: 'poi.park',
                elementType: 'labels.text.fill',
                stylers: [{color: '#30753e'}]
            },
            {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{color: '#d1c19e'}]
            },
            {
                featureType: 'road.arterial',
                elementType: 'geometry',
                stylers: [{color: '#dbc053'}]
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry',
                stylers: [{color: '#e9b158'}]
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry.stroke',
                stylers: [{color: '#dba355'}]
            },
            {
                featureType: 'road.highway.controlled_access',
                elementType: 'geometry',
                stylers: [{color: '#e98d58'}]
            },
            {
                featureType: 'road.highway.controlled_access',
                elementType: 'geometry.stroke',
                stylers: [{color: '#db8555'}]
            },
            {
                featureType: 'road.local',
                elementType: 'labels.text.fill',
                stylers: [{color: '#151c38'}]
            },
            {
                featureType: 'transit.line',
                elementType: 'geometry',
                stylers: [{color: '#7f7fa3'}]
            },
            {
                featureType: 'transit.line',
                elementType: 'labels.text.fill',
                stylers: [{color: '#8f7d77'}]
            },
            {
                featureType: 'transit.line',
                elementType: 'labels.text.stroke',
                stylers: [{color: '#ebe3cd'}]
            },
            {
                featureType: 'transit.station',
                elementType: 'geometry',
                stylers: [{color: '#c9cfe5'}]
            },
            {
                featureType: 'water',
                elementType: 'geometry.fill',
                stylers: [{color: '#b5dfff'}]
            },
            {
                featureType: 'water',
                elementType: 'labels.text.fill',
                stylers: [{color: '#6d7269'}]
            }
        ],
        { name: 'Styled' }
    );

    // Creates Google Maps at the DOM element which has an id map; with
    // Latitude and Longitude for center and Zoom level (0-21) for area.
    map = new google.maps.Map(
        document.getElementById('map'),
        {
            center: center,
            zoom: 13,
            // Optional
            //styles: styles,
            // Optional: To disable [Map,Satellite,..] buttons, true by default
            mapTypeControl: true,
            // Optional: For extra map types or restrict them
            mapTypeControlOptions: {
                mapTypeIds: [
                    'roadmap',
                    'satellite',
                    'hybrid',
                    'terrain',
                    'my_style'
                ]
            }
        }
    );

    //Associate the styled map with the MapTypeId and set it to display.
    map.mapTypes.set('my_style', my_styledMapType);
    map.setMapTypeId('my_style');

    map.addListener('click', close_infoWindow);

    // Create an infoWindow
    infoWindow = new google.maps.InfoWindow();
    infoWindow.addListener('closeclick', close_infoWindow);

    // Create Bounds
    bounds = new google.maps.LatLngBounds();

    // Marker Icons
    default_marker_icon = create_marker_icon('flag/default.png');
    hover_marker_icon = create_marker_icon('flag/hover.png');
    selected_marker_icon = create_marker_icon('flag/selected.png');
    
    console.log("Created Google Maps");

    createPlaces();
}

function set_infoWindow(marker, content)
{
    // To stop setting and opening info window if already open at the same
    // marker
    if(infoWindow.marker != marker)
    {
        //infoWindow.setContent(content);
        infoWindow.marker = marker;

        var streetView_service = new google.maps.StreetViewService();
        var radius = 50;

        function get_streetView(data, status)
        {
            if(status == google.maps.StreetViewStatus.OK)
            {
                console.log("1");
                var nearBy_streetView_location = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearBy_streetView_location,
                    marker.position
                );

                content += '<div id="panorama"></div>';
                infoWindow.setContent(content);
                infoWindow.open(map, marker);
                console.log(content);

                var panorama_options = {
                    position: nearBy_streetView_location,
                    pov: {
                        heading: heading,
                        pitch: 30
                    }
                };

                console.log("Creating panorama");
                var panorama = new google.maps.StreetViewPanorama(
                    document.getElementById("panorama"),
                    panorama_options
                );
                panorama.setVisible(true);
                console.log("Panorama created");
            }
            else
            {
                content += '<div>Loading Street View Failed!</div>';
                infoWindow.setContent(content);
                infoWindow.open(map, marker);
            }

            // Set infoWindow content and open
            //infoWindow.marker = marker;
            //infoWindow.setContent(content);
            //infoWindow.open(map, marker);
            // To close the infoWindow
            //infoWindow.addListener('closeclick', close_infoWindow);
        }
        console.log("start");
        streetView_service.getPanoramaByLocation(
            marker.position,
            radius,
            get_streetView
        );
        console.log("end");
    }
}

function close_infoWindow()
{
    infoWindow.marker = null;
    infoWindow.close();
    reset_all_markers_icons();
}

function create_marker_icon(url)
{
    var icon = new google.maps.MarkerImage(
        // url
        'images/marker_icons/' + url,
        // size
        new google.maps.Size(134/10, 226/10),
        // origin
        new google.maps.Point(0, 0),
        // anchor
        new google.maps.Point(((134-1)/10)*0.04, (226-1)/10),
        //scale
        new google.maps.Size(134/10, 226/10)
    )

    return icon;
}
