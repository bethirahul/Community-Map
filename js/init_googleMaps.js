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

var mainInfoWindow;
var mainInfoWindow_place_id;
var bounds;
var default_marker_icon;
var hover_marker_icon;
var selected_marker_icon;

var drawing_manager;
var polygon;

var directionsDisplay;

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
                style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
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

    map.addListener('click', close_mainInfoWindow);

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
            
            if(directionsDisplay)
                if(directionsDisplay.getMap())
                    directionsDisplay.setMap(null);

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
            polygon.addListener('click', close_mainInfoWindow);

            search_within_polygon();
        }
    );

    // Create an mainInfoWindow
    mainInfoWindow = new google.maps.InfoWindow();
    mainInfoWindow.addListener('closeclick', close_mainInfoWindow);

    // Create Bounds
    bounds = new google.maps.LatLngBounds();

    // Marker Icons
    default_marker_icon = create_marker_icon(
            'flag/default.png', 134, 226, 0.1, 0.04);
    hover_marker_icon = create_marker_icon(
            'flag/hover.png', 134, 226, 0.1, 0.04);
    selected_marker_icon = create_marker_icon(
            'flag/selected.png', 134, 226, 0.1, 0.04);
    
    console.log("Created Google Maps");

    createPlaces();
}

function search_within_polygon()
{
    area = google.maps.geometry.spherical.computeArea(polygon.getPath());
    alert(area + " square meters");
    // Close mainInfoWindow
    if(mainInfoWindow.marker)
        close_mainInfoWindow();
    
    // Show/Hide markers
    for(var i=0; i<places.length; i++)
    {
        if(google.maps.geometry.poly.containsLocation(
            places[i].marker.position,
            polygon
        ))
            places[i].showHide_marker(true);
        else
            places[i].showHide_marker(false);
    }
}

function set_mainInfoWindow(id)
{
    // To stop setting and opening info window if already open at the same
    // marker
    if(mainInfoWindow.marker != places[id].marker)
    {
        //infoWindow.setContent(content);
        if(mainInfoWindow.marker != null)
        {
            mainInfoWindow.marker.setIcon(default_marker_icon);
            if(places[mainInfoWindow_place_id].infoWindow.marker != null)
                places[mainInfoWindow_place_id].infoWindow.open(
                    map,
                    places[mainInfoWindow_place_id].marker
                );
        }

        mainInfoWindow_place_id = id;

        mainInfoWindow.marker = places[id].marker;
        mainInfoWindow.marker.setIcon(selected_marker_icon);

        if(places[id].infoWindow.marker == places[id].marker)
            places[id].infoWindow.close();

        var streetView_service = new google.maps.StreetViewService();
        var radius = 50;

        function get_streetView(data, status)
        {
            var content = '<div id="infoWindow">' + places[id].description;
            content += "<br/>(" + places[id].location.lat;
            content += ", " + places[id].location.lng + ")</div>";

            if(status == google.maps.StreetViewStatus.OK)
            {
                var nearBy_streetView_location = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearBy_streetView_location,
                    places[id].marker.position
                );

                content += '<div id="panorama"></div>';
                mainInfoWindow.setContent(content);
                mainInfoWindow.open(map, places[id].marker);

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
                mainInfoWindow.setContent(content);
                mainInfoWindow.open(map, places[id].marker);
            }
        }

        streetView_service.getPanoramaByLocation(
            places[id].marker.position,
            radius,
            get_streetView
        );
    }
}

function close_mainInfoWindow()
{
    if(mainInfoWindow.marker != null)
    {
        mainInfoWindow.marker.setIcon(default_marker_icon);
        if(places[mainInfoWindow_place_id].infoWindow.marker != null)
            places[mainInfoWindow_place_id].infoWindow.open(
                map,
                places[mainInfoWindow_place_id].marker
            );
        mainInfoWindow.marker = null;
        mainInfoWindow.close();
    }
}

function create_marker_icon(url, w, h, s, anchor_ratio)
{
    var ws = w * s;
    var hs = h * s;

    var icon = new google.maps.MarkerImage(
        'images/marker_icons/' + url,                           // url
        new google.maps.Size(ws, hs),                           // size
        new google.maps.Point(0, 0),                            // origin
        new google.maps.Point(((w-1)*s)*anchor_ratio, (h-1)*s), // anchor
        new google.maps.Size(ws, hs)                            //scale
    )

    return icon;
}

function searchWithInTime(event=null)
{
    if(event)
        if(event.key !== 'Enter')
            return;

    var address = document.getElementById('searchWithInTime-addressBar').value;
    
    if(address != '')
    {
        if(directionsDisplay)
            if(directionsDisplay.getMap())
                directionsDisplay.setMap(null);
        
        var travelMode = google.maps.TravelMode[
            document.getElementById('searchWithInTime-mode-select').value
        ];

        /*for(var i=0; i<places.length; i++)
        {
            places[i].showHide_marker(false);
        }*/
        var distanceMatrixService = new google.maps.DistanceMatrixService();
        var origins = [];
        for(var i=0; i<places.length; i++)
            origins.push(places[i].marker.position);
        destinations = [];
        destinations.push(address);
        
        distanceMatrixService.getDistanceMatrix(
            {
                origins: origins,
                destinations: destinations,
                travelMode: travelMode,
                unitSystem: google.maps.UnitSystem.IMPERIAL
            },
            // call-back function
            function(response, status)
            {
                if(status == google.maps.DistanceMatrixStatus.OK)
                {
                    show_markers_withIn_time(response);
                }
                else
                    alert(
                        "No results were found with that address. Error: " +
                        status
                    );
            }
        );

    }
    else
        alert("You must enter an address to search with-in time and mode of transport.");
}

function show_markers_withIn_time(response)
{
    if(polygon)
        polygon.setMap(null);

    var max_ETA = document.getElementById('searchWithInTime-range-select')
            .value;
    var origins = response.originAddresses;
    var destinations = response.destinationAddresses;
    var results_found = 0;
    var first_result_location;
    var new_bounds = new google.maps.LatLngBounds();

    for(var i=0; i<origins.length; i++)
    {
        var elements = response.rows[i].elements;
        for(var j=0; j<elements.length; j++)
        {
            if(elements[j].status === 'OK')
            {
                distance_text = elements[j].distance.text;
                duration = elements[j].duration.value; // in seconds
                duration_text = elements[j].duration.text;
                if(duration <= (max_ETA * 60)) // comparing time in seconds
                {
                    places[i].showHide_marker(true);
                    new_bounds.extend(places[i].location);
                    results_found++;
                    if(results_found == 1)
                        first_result_location = places[i].location;
                    content = '<p>' + distance_text + '<br/>';
                    content += duration_text + '</p>\n';
                    content += '<button id="show-directions-btn" ';
                    content += 'onclick="show_directions(&quot;';
                    content += origins[i] + '&quot;)">Show Directions</button>';
                    places[i].set_infoWindow(content);
                }
                else
                    places[i].showHide_marker(false);
            }
        }
    }
    if(results_found > 0)
    {
        if(results_found > 1)
            map.fitBounds(new_bounds);
        else
        {
            map.setCenter(first_result_location);
            map.setZoom(15);
        }
    }
    else
        alert("No results were found with that address.");
}

function show_directions(origin)
{
    var destination = document.getElementById('searchWithInTime-addressBar').value;
    var travelMode = google.maps.TravelMode[
        document.getElementById('searchWithInTime-mode-select').value
    ];

    var directionsService = new google.maps.DirectionsService;
    directionsService.route(
        {
            origin: origin,
            destination: destination,
            travelMode: travelMode,
            provideRouteAlternatives: true
        },
        // call-back function
        function(response, status)
        {
            if(status === google.maps.DirectionsStatus.OK)
            {
                directionsDisplay = new google.maps.DirectionsRenderer(
                    {
                        map:map,
                        directions: response,
                        draggable: true,
                        polylineOptions: {
                            strokeColor: 'DodgerBlue'
                        }
                    }
                );
            }
            else
                alert("Directions request Error: " + status);
        }
    );
}
