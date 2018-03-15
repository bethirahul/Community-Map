
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
    )
    self.marker.addListener(
        'mouseout',
        function()
        {
            if(main_infoWindow.marker != self.marker)
                this.setIcon(default_marker_icon);
        }
    )
    self.marker.addListener(
        'click',
        function()
        {
            set_mainInfoWindow(self.id);
        }
    )

    self.showHide_marker = function(state)
    {
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
                if(main_infoWindow.marker == self.marker)
                    close_main_infoWindow();
                self.close_infoWindow();
            }
        }
    }
}

var places = [];

function createPlaces()
{
    //fetch("http://localhost:8000/places/json")
    fetch("http://192.168.0.107:8000/places/json")
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

function showHide_all_markers(state)
{
    if(places[0])
    {
        close_main_infoWindow();
        close_places_infoWindows();

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

function close_places_infoWindows()
{
    for(var i=0; i<places.length; i++)
        places[i].close_infoWindow();
}

function toggle_drawing(btn)
{
    if(drawing_manager.map)
    {
        drawing_manager.setMap(null);
        if(polygon)
            polygon.setMap(null);
        btn.innerHTML = "Search with-in area";
    }
    else
    {
        drawing_manager.setMap(map);
        drawing_manager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
        btn.innerHTML = "Hide drawing tools";
    }
}

function zoomIn_to_address(event=null)
{
    if(event)
    {
        if(event.key !== 'Enter')
        {
            /*var pac_container =
                    document.getElementsByClassName('pac-container')[0];
            if(pac_container)
                console.log("Found .pac-container");
            pac_container.style.position = 'absolute';
            pac_container.style.bottom = '10mm';*/

            /*pac = $('.pac-container');
            pac.css('position', 'absolute');
            pac.css('top', 'calc(100vh - 50mm)');*/
            
            return;
        }
    }
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

function toggle_searchWithIn(btn)
{
    search = document.getElementById('searchWithInTime');
    initial_state = search.style.display;
    if(initial_state == 'none' || initial_state == '')
    {
        search.style.display = 'block';
        btn.innerHTML = 'Hide Search';
    }
    else
    {
        search.style.display = 'none';
        btn.innerHTML = 'Show Search';
        close_places_infoWindows();
        
        if(directionsDisplay)
            if(directionsDisplay.getMap())
                directionsDisplay.setMap(null);
    }
}

function adjustRevert_autoComplete_style(state)
{
    var pac_styleSheet = document.getElementById('pac-style');
    
    if(state)
    {
        pac_height = "58mm"
        bar_height = document.getElementById("zoomIn-addressBar").clientHeight;
        rule = ".pac-container { "
        rule += "top: calc(100% - " + bar_height + "px - " + pac_height + ")";
        rule += " !important; }";
        pac_styleSheet.innerHTML = rule;
    }
    else
        pac_styleSheet.innerHTML = '';
}


var Search_result = function()
{
    var self = this;
    
    self.marker = new google.maps.Marker
}
