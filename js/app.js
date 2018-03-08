
var place = function(name, {lat, lng})
{
    this.name = name;
    this.loc = {lat, lng};
    this.marker = new google.maps.Marker(
            {
                position: this.loc,
                map: map,
                title: this.name
            }
        );
}

var millValley;

function createPlaces()
{
    millValley = new place(
        'Mill Valley',
        {lat: 37.884065, lng: -122.530635}
    );
    console.log("Created Places:");
    console.log(millValley.name, millValley.loc);
}