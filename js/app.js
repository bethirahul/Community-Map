
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
            animation: google.maps.Animation.DROP
        }
    );
    self.description = description;
    
    self.marker.addListener(
        'click',
        function() { set_InfoWindow(this, self.description); }
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
                places.push(new_place);
                bounds.extend(new_place.location);
            }
            console.log("Created Places:");
            print_places();
            map.fitBounds(bounds);
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
        if(isVisible)
            btn.innerHTML = "Hide Markers";
        else
            btn.innerHTML = "Show Markers";
        for(var i=0; i<places.length; i++)
            places[i].marker.setVisible(!isVisible);
    }
}
