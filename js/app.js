
var Place = function(name, {lat, lng}, description)
{
    var self = this;

    self.name = name;
    self.location = {lat, lng};
    self.marker = new google.maps.Marker(
        {
            position: self.location,
            map: map,
            title: self.name
        }
    );
    self.description = description;
    
    self.marker.addListener(
        'click',
        function()
        {
            infoWindow.setContent(self.description);
            infoWindow.open(map, self.marker);
            console.log("Info window content set and opened");
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
                    json_data.Places[i].name,
                    json_data.Places[i].location,
                    json_data.Places[i].description
                )
                places.push(new_place);
            }
            console.log("Created Places:");
            print_places();
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