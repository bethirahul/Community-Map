function make_url(url, parameters={})
{
    parameters_length = Object.keys(parameters).length;
    if(parameters_length > 0)
    {
        url += '?';
        k = 0;
        for(key in parameters)
        {
            value = parameters[key];
            if(value.constructor === Array)
            {
                url += key + '=' + value[0];
                for(var i=1; i<value.length; i++)
                    url += "," + value[i];
            }
            else
                url += key + '=' + value;
            if(k < parameters_length-1)
                url += '&';
            k++;
        }
    }

    return url;
}

(function()
{
    var url = "https://maps.googleapis.com/maps/api/js";
    var parameters = {
        'key': 'AIzaSyCxJAircwo3jIDVpKa2WCDz86mdtX-YOng',
        'libraries': ['geometry', 'drawing'],
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

var drawing_manager;
var polygon;

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
            },
            fullscreenControl: false
        }
    );

    //Associate the styled map with the MapTypeId and set it to display.
    map.mapTypes.set('my_style', my_styledMapType);
    map.setMapTypeId('my_style');

    map.addListener('click', close_infoWindow);

    // Drawing mode
    drawing_manager = new google.maps.drawing.DrawingManager(
        {
            drawingMode: google.maps.drawing.OverlayType.POLYGON,
            drawingControl: true,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_LEFT,
                drawingModes: [
                    google.maps.drawing.OverlayType.POLYGON
                ]
            }
        }
    );
    // Event listener when polygon is complete
    drawing_manager.addListener(
        'overlaycomplete',
        function(event)
        {
            // close polygon
            if(polygon)
                polygon.setMap(null);

            // Close all markers
            //reset_all_markers_icons();
            //for(var i=0; i<places.length; i++)
                //places[i].marker.setVisible(false);

            // Switch to hand mode, no more drawing.
            drawing_manager.setDrawingMode(null);

            // new polygon from the completed one
            polygon = event.overlay;

            // make this newly created polygon as editable
            polygon.setEditable(true);
            // add event listeners tho this newly created polygon
            // which trigger when it is edited.
            polygon.getPath().addListener(
                'set_at',
                search_within_polygon
            );
            polygon.getPath().addListener(
                'insert_at',
                search_within_polygon
            );
            polygon.addListener('click', close_infoWindow);

            search_within_polygon();
        }
    );

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

function search_within_polygon()
{
    area = google.maps.geometry.spherical.computeArea(polygon.getPath());
    alert(area + " square meters");
    // Close infoWindow
    if(infoWindow.marker)
        close_infoWindow();
    
    // Show/Hide markers
    for(var i=0; i<places.length; i++)
    {
        if(google.maps.geometry.poly.containsLocation(
            places[i].marker.position,
            polygon
        ))
        {
            if(!places[i].marker.getVisible())
            {
                places[i].marker.setVisible(true);
                places[i].marker.setAnimation(google.maps.Animation.DROP);
            }
        }
        else
        {
            if(places[i].marker.getVisible())
            {
                places[i].marker.setIcon(default_marker_icon);
                places[i].isSelected = false;
                places[i].marker.setVisible(false);
            }
        }
    }
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
                var nearBy_streetView_location = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearBy_streetView_location,
                    marker.position
                );

                content += '<div id="panorama"></div>';
                infoWindow.setContent(content);
                infoWindow.open(map, marker);

                var panorama_options = {
                    position: nearBy_streetView_location,
                    pov: {
                        heading: heading,
                        pitch: 20
                    }
                };
                var panorama = new google.maps.StreetViewPanorama(
                    document.getElementById("panorama"),
                    panorama_options
                );
                panorama.setVisible(true);
            }
            else
            {
                content += '<div>Loading Street View Failed!</div>';
                infoWindow.setContent(content);
                infoWindow.open(map, marker);
            }
        }

        streetView_service.getPanoramaByLocation(
            marker.position,
            radius,
            get_streetView
        );
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
