
var Place = function(id, name, {lat, lng}, description)
{
    var self = this;

    self.id = id;
    self.name = name;
    self.location = {lat, lng};
    self.marker = new google.maps.Marker(
        {
            id: self.id,
            position: self.location,
            map: map,
            title: self.name,
            icon: default_marker_icon,
            animation: google.maps.Animation.DROP
        }
    );
    self.infoWindow = new google.maps.InfoWindow();
    self.infoWindow.addListener(
        'closeclick',
        function()
        {
            self.close_infoWindow();
        }
    );

    self.set_infoWindow = function(content)
    {
        self.infoWindow.marker = self.marker;
        self.infoWindow.setContent(content);
        self.infoWindow.open(map, self.marker);
        self.infoWindow.setZIndex(id+1);
    }

    self.close_infoWindow = function()
    {
        if(self.infoWindow.marker != null)
        {
            self.infoWindow.marker = null;
            self.infoWindow.close();
        }
    }

    self.description = description;
    
    self.marker.addListener(
        'mouseover',
        function()
        {
            if(main_infoWindow.marker != self.marker)
                this.setIcon(hover_marker_icon);
        }
    );
    self.marker.addListener(
        'mouseout',
        function()
        {
            if(main_infoWindow.marker != self.marker)
                this.setIcon(default_marker_icon);
        }
    );
    self.marker.addListener(
        'click',
        function()
        {
            set_mainInfoWindow(self.id);
        }
    );

    self.showHide_marker = function(state)
    {
        if(main_infoWindow.marker == self.marker)
            close_main_infoWindow();
        self.close_infoWindow();
        
        if(self.marker.getVisible() != state)
        {
            self.marker.setVisible(state);
            if(state)
            {
                self.marker.setIcon(default_marker_icon);
                self.marker.setAnimation(google.maps.Animation.DROP);
            }
            else
            {
                /*if(main_infoWindow.marker == self.marker)
                    close_main_infoWindow();*/
                self.close_infoWindow();
            }
        }
    }
}

//==============================================================================

var places = [];

function createPlaces()
{
    //fetch("http://localhost:8000/places/json")
    fetch("http://192.168.0.107:8000/places/json")
    //fetch("http://192.168.1.220:8000/places/json")
    .then(
        function(data)
        {
            return data.json();
        }
    )
    .then(
        function(json_data)
        {
            for(var i=0; i<json_data.Places.length; i++)
            {
                var new_place = new Place(
                    i,
                    json_data.Places[i].name,
                    json_data.Places[i].location,
                    json_data.Places[i].description
                )
                new_place.marker.setVisible(false);
                places.push(new_place);
                bounds.extend(new_place.location);
            }
            console.log("Created Places:");
            print_places();
        }
    )
    .catch(
        function(error)
        {
            console.log("Error occured while fetching for places data:")
            console.log(error);
        }
    );

}

function print_places()
{
    for(var i=0; i<places.length; i++)
    {
        result = {
            name: places[i].name,
            location: places[i].location,
            description: places[i].description
        };
        console.log(result);
    }
}

//------------------------------------------------------------------------------

/*function reset_all_infoWindows_zIndex()
{
    for(var i=0; i<places.length; i++)
        places[i].infoWindow.setZIndex(i);
}*/

function showHide_all_markers(state)
{
    if(places[0])
    {
        close_main_infoWindow();
        close_places_infoWindows();
        //showHide_searchPlaces(false);

        if(polygon)
            polygon.setMap(null);

        if(directionsDisplay)
            if(directionsDisplay.getMap())
                directionsDisplay.setMap(null);

        for(var i=0; i<places.length; i++)
            places[i].showHide_marker(state);

        if(state)
            map.fitBounds(bounds);
    }
}

//------------------------------------------------------------------------------

function bring_to_front(id)
{
    close_main_infoWindow();
    
    var zIndex_of_id = places[id].infoWindow.getZIndex();
    for(var i=0; i<places.length; i++)
    {
        var zIndex_of_i = places[i].infoWindow.getZIndex();
        if(id != i && zIndex_of_i > zIndex_of_id)
            places[i].infoWindow.setZIndex(zIndex_of_i - 1);
    }
    places[id].infoWindow.setZIndex(places.length);
}

function close_places_infoWindows()
{
    for(var i=0; i<places.length; i++)
        places[i].close_infoWindow();
}

//==============================================================================

function start_drawing()
{
    if(polygon)
        polygon.setMap(null);
    init_drawing_manager();
    drawing_manager.setMap(map);
    //drawing_manager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    close_main_infoWindow();
    for(var i=0; i<places.length; i++)
        places[i].close_infoWindow();
    showHide_searchPlaces(false);
}

//==============================================================================

function zoomIn_to_address(event=null)
{
    if(event)
        if(event.key !== 'Enter')
            return;

    var address_bar = document.getElementById('zoomIn-addressBar');
    if(address_bar.value != '')
    {
        if(polygon)
            polygon.setMap(null);
        
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode(
            {
                address: address_bar.value,
                //componentRestrictions: { locality: 'San Jose' }
            },
            // call back function
            function(results, status)
            {
                if(status == google.maps.GeocoderStatus.OK)
                {
                    address_bar.value = results[0].formatted_address;
                    // center map to first result location
                    map.setCenter(results[0].geometry.location);
                    map.setZoom(15);
                }
                else
                    alert("No results were found with that address.");
            }
        );
    }
    else
        alert("You must enter an address to zoom-in.");
}

//==============================================================================

function adjustRevert_autoComplete_style(state)
{
    var pac_styleSheet = document.getElementById('pac-style');
    
    if(state)
    {
        pac_height = "52mm"
        bar_height = document.getElementById("zoomIn-addressBar").clientHeight;
        rule = ".pac-container { "
        rule += "top: calc(100% - " + bar_height + "px - " + pac_height + ")";
        rule += " !important; }";
        pac_styleSheet.innerHTML = rule;
    }
    else
        pac_styleSheet.innerHTML = '';
}


//==============================================================================
//         S E A R C H      W I T H - I N
//==============================================================================

function toggle_searchWithIn(btn)
{
    var search = document.getElementById('searchWithInTime');
    var initial_state = search.style.display;
    if(initial_state == 'none' || initial_state == '')
    {
        showHide_searchWithInTime(true);
        showHide_searchPlaces(false);
    }
    else
        showHide_searchWithInTime(false);
}


function showHide_searchWithInTime(state)
{
    search = document.getElementById('searchWithInTime');
    btn = document.getElementById('searchWithInTime-toggle-btn');
    if(state)
    {
        search.style.display = 'block';
        btn.innerHTML = 'Hide Search';
    }
    else
    {
        search.style.display = 'none';
        btn.innerHTML = 'Search with-in<br/>Travel time';

        close_places_infoWindows();
        
        if(directionsDisplay)
            if(directionsDisplay.getMap())
                directionsDisplay.setMap(null);
    }
}


//==============================================================================
//         S E A R C H      P L A C E S
//==============================================================================

var Search_place = function(id, result)
{
    var self = this;

    self.id = id;
    self.placeID = result.place_id;
    self.name = result.name;
    self.location = result.geometry.location;
    /*if(result.formatted_address)
        self.address = result.formatted_address;
    if(result.formatted_phone_number)
        self.phone = result.formatted_phone_number;
    if(result.opening_hours)
        self.opening_hrs = result.opening_hours.weekday_text;
    if(result.photos)
        self.img_url = result.photos[0].getUrl(
            {
                maxHeight: 100,
                maxWidth: 200
            }
        );*/
    self.marker = new google.maps.Marker(
        {
            id: self.placeID,
            position: self.location,
            map: map,
            title: self.name,
            icon: create_marker_icon(result.icon, 35, 35, 0.75, 0.5),
            animation: google.maps.Animation.DROP
        }
    );

    /*self.marker.addListener(
        'mouseover',
        function()
        {
            if(search_infoWindow.marker != self.marker)
                this.setIcon(hover_marker_icon);
        }
    );
    self.marker.addListener(
        'mouseout',
        function()
        {
            if(search_infoWindow.marker != self.marker)
                this.setIcon(default_marker_icon);
        }
    );*/
    self.marker.addListener(
        'click', function() { set_searchInfoWindow(self.id); } );
    
    self.marker.setVisible(true);
}

//==============================================================================

var search_places = [];

function create_search_places(results)
{
    close_all_search_places();
    var bounds = new google.maps.LatLngBounds();
    for(var i=0; i<results.length; i++)
    {
        var icon = create_marker_icon(results[i].icon, 35, 35, 0.75, 0.5);
        var new_search_place = new Search_place(i, results[i]);
        search_places.push(new_search_place);
        if(results[i].geometry.viewport)
            bounds.union(results[i].geometry.viewport);
        else
            bounds.extend(results[i].geometry.location);
    }
    map.fitBounds(bounds);
}

function close_all_search_places()
{
    close_searchInfoWindow();
    for(var i=0; i<search_places.length; i++)
        search_places[i].marker.setMap(null);

    search_places = [];
}

function toggle_searchPlaces(btn)
{
    var search = document.getElementById('searchPlaces');
    var initial_state = search.style.display;
    if(initial_state == 'none' || initial_state == '')
    {
        showHide_searchPlaces(true);
        showHide_searchWithInTime(false);
    }
    else
        showHide_searchPlaces(false);
}


function showHide_searchPlaces(state)
{
    search = document.getElementById('searchPlaces');
    btn = document.getElementById('searchPlaces-toggle-btn');
    if(state)
    {
        search.style.display = 'block';
        btn.innerHTML = 'Hide Search';
    }
    else
    {
        search.style.display = 'none';
        btn.innerHTML = 'Search<br/>other places';
        close_all_search_places();
    }
}

//==============================================================================


