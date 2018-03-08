
var place = function(name, {lat, lng}, description)
{
    var self = this;

    self.name = name;
    self.loc = {lat, lng};
    self.marker = new google.maps.Marker(
        {
            position: this.loc,
            map: map,
            title: this.name
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

var millValley;

function createPlaces()
{
    millValley = new place(
        'Mill Valley',
        {lat: 37.884065, lng: -122.530635},
        'This place is generally called Mill Valley'
    );
    console.log("Created Places:");
    console.log(millValley.name, millValley.loc. millValley.description);
}