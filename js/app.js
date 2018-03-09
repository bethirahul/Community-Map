
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
    self.isSelected = false;

    var content = '<div id="info-window">' + self.description;
    content += "<br/>(" + self.location.lat;
    content += ", " + self.location.lng + ")</div>";

    
    self.marker.addListener(
        'mouseover',
        function()
        {
            if(!self.isSelected)
                this.setIcon(hover_marker_icon);
        }
    )
    self.marker.addListener(
        'mouseout',
        function()
        {
            if(!self.isSelected)
                this.setIcon(default_marker_icon);
        }
    )
    self.marker.addListener(
        'click',
        function()
        {
            reset_all_markers_icons();
            set_infoWindow(this, content);
            this.setIcon(selected_marker_icon);
            self.isSelected = true;
        }
    )
}

var places = [];

function createPlaces()
{
    fetch("http://localhost:8000/places/json")
    .then(
        function(data)
        {
            //console.log(data);
            return data.json();
        }
    )
    .then(
        function(json_data)
        {
            for(var i=0; i<json_data.Places.length; i++)
            {
                //console.log(json_data.Places[i])
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

function toggle_markers(btn)
{
    if(places[0])
    {
        //var btn = document.getElementById("toggle-markers-btn");
        var isVisible = places[0].marker.getVisible();
        for(var i=0; i<places.length; i++)
            places[i].marker.setVisible(!isVisible);

        if(!isVisible)
        {
            btn.innerHTML = "Hide Markers";
            map.fitBounds(bounds);
        }
        else
            btn.innerHTML = "Show Markers";
    }
}

function reset_all_markers_icons()
{
    for(var i=0; i<places.length; i++)
    {
        places[i].marker.setIcon(default_marker_icon);
        places[i].isSelected = false;
    }
}
