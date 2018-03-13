
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
    self.description = description;

    var content = '<div id="infoWindow">' + self.description;
    content += "<br/>(" + self.location.lat;
    content += ", " + self.location.lng + ")</div>";
    
    self.marker.addListener(
        'mouseover',
        function()
        {
            if(infoWindow.marker != self.marker)
                this.setIcon(hover_marker_icon);
        }
    )
    self.marker.addListener(
        'mouseout',
        function()
        {
            if(infoWindow.marker != self.marker)
                this.setIcon(default_marker_icon);
        }
    )
    self.marker.addListener(
        'click',
        function() { set_infoWindow(this, content); }
    )

    self.showHide_marker = function(state)
    {
        self.marker.setVisible(state);
        if(state)
        {
            self.marker.setIcon(default_marker_icon);
            self.marker.setAnimation(google.maps.Animation.DROP);
        }
        else if(infoWindow.marker == self.marker)
            close_infoWindow();
    }
}

var places = [];

function createPlaces()
{
    fetch("http://localhost:8000/places/json")
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
        if(polygon)
            polygon.setMap(null);

        for(var i=0; i<places.length; i++)
        {
            if(places[i].marker.getVisible() != state)
                places[i].showHide_marker(state);
        }

        if(state)
            map.fitBounds(bounds);
    }
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
        btn.innerHTML = "Hide drawing tools";
    }
}

function zoomIn_to_address(event=null)
{
    if(event)
        if(event.key !== 'Enter')
            return;
    var address_bar = document.getElementById('zoomIn-addressBar');
    if(address_bar.value != '')
    {
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
    }
}

function searchWithInTime(event=null)
{
    if(event)
        if(event.key !== 'Enter')
            return;
    var address = document.getElementById('searchWithInTime-addressBar').value;
    
    if(address != '')
    {
        var mode = document.getElementById('searchWithInTime-mode-select')
                .value;
        var range = document.getElementById('searchWithInTime-range-select')
                .value;
        
        console.log(address, mode, range);

        reset_all_markers_icons();
        for(var i=0; i<places.length; i++)
        {
            places[i].marker.setVisible(false);
        }
        //var distanceMatrixService = new.google.maps.DistanceMatrixService;

    }
    else
        alert("You must enter an address to search with-in time and mode of transport.");
}
