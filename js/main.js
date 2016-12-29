var map;
var markers = [];

function initMap() {
  /* Pale Dawn Styles url: https://snazzymaps.com/style/1/pale-dawn */
  var paleDawnStyles = [
    {
      "featureType": "administrative",
      "elementType": "all",
      "stylers": [
        {
          "visibility": "on"
        },
        {
          "lightness": 33
        }
      ]
    },
    {
      "featureType": "landscape",
      "elementType": "all",
      "stylers": [
        {
          "color": "#f2e5d4"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#c5dac6"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels",
      "stylers": [
        {
          "visibility": "on"
        },
        {
          "lightness": 20
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "all",
      "stylers": [
        {
          "lightness": 20
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#c5c6c6"
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#e4d7c6"
        }
      ]
    },
    {
      "featureType": "road.local",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#fbfaf7"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "all",
      "stylers": [
        {
          "visibility": "on"
        },
        {
          "color": "#acbcc9"
        }
      ]
    }];
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 41.8937663, lng: -87.617595},
    zoom: 13,
    // Set styles for map
    styles: paleDawnStyles,
    // Disable ability to switch between map types
    mapTypeControl: false
  });

  // musicVenues holds the music venue locations for all our markers
  var musicVenues = [
    {title: 'Aragon Ballroom', location: {lat: 41.9694, lng: -87.6580}},
    {title: 'Kingston Mines', location: {lat: 41.9286, lng: -87.6490}},
    {title: 'Sound Bar', location: {lat: 41.8934, lng: -87.6354}},
    {title: 'Navy Pier', location: {lat: 41.8917, lng: -87.6063}},
    {title: 'Chicago Symphony Center', location: {lat: 41.8790, lng: -87.6251}},
    {title: 'Buddy Guy\'s Legends', location: {lat: 41.8730, lng: -87.6262}},
    {title: 'United Center', location: {lat: 41.8807, lng: -87.6742}},
    {title: 'Concord Music Hall', location: {lat: 41.9187, lng: -87.6899}},
    {title: 'Double Door', location: {lat: 41.9098, lng: -87.6773}},
    {title: 'Metro', location: {lat: 41.9498, lng: -87.6588}},
    {title: 'House of Blues', location: {lat: 41.8882, lng: -87.6291}}
  ];

  var largeInfoWindow = new google.maps.InfoWindow();

  // Create default icon (red)
  var defaultIcon = makeMarkerIcon('FF0000');

  // Create a highlighted marker for when use mouses over (yellow)
  var highlightedIcon = makeMarkerIcon('FFFF24');

  // Create a list of markers based off musicVenues array
  for (var i = 0; i < musicVenues.length; i++) {
    // Get the position from musicVenues array
    var position = musicVenues[i].location;
    var title = musicVenues[i].title;
    // Create a marker for each location, then push markers into an array
    var marker = new google.maps.Marker({
      map: map,
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      icon: defaultIcon,
      id: i
    });
    // Push the marker to our array of markers
    markers.push(marker);
    // Create an onclick even to open an infoWindow at each marker
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfoWindow);
    });

    // Set marker color to yellow on mouseover event
    marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
    });
    // Set marker color to red on mouseout event - back to default
    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });
  }
  document.getElementById('show-listings').addEventListener('click', showListings);
  document.getElementById('hide-listings').addEventListener('click', hideListings);
} // end initMap()

// This function populates the infoWindow when the marker is clicked
// Only allow one infoWindow which will open at the clicked marker,
// Populating window based on the marker's position
function populateInfoWindow(marker, infoWindow) {
  // First check to make sure infoWindow is not already opened on this marker
  if (infoWindow.marker != marker) {
    infoWindow.setContent('');
    infoWindow.marker = marker;
//    infoWindow.setContent('<div>' + marker.title + '</div>');
//    infoWindow.open(map, marker);
    // Make sure marker property is cleared if the infoWindow is closed
    infoWindow.addListener('closeclick', function() {
      infoWindow.marker = null;
    });
    var streetViewService = new google.maps.StreetViewService();
    var radius = 50;
    // If status is OK, which means pano was found, compute the position of streetView
    // image, then calculate the heading, then get a panorama from that and
    // set the options
    function getStreetView(data, status) {
      if (status == google.maps.StreetViewStatus.OK) {
        var nearStreetViewLocation = data.location.latLng;
        var heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLocation, marker.position);
        infoWindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
        var panoramaOptions = {
          position: nearStreetViewLocation,
          pov: {
            heading: heading,
            pitch: 30
          }
        };
        var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);
        console.log("StreetView Status was OK");
      } else {
        infoWindow.setContent('<div>' + marker.title + '</div>' + '<div>No Street View Found</div>');
        console.log("Streetview Status was not ok");
      }
    }
    // Use streetview service to get closest streetview image within
    // 50 meters of the markers position
    streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
    // Open the infoWindow on the correct marker
    infoWindow.open(map, marker);
  }
}

function showListings() {
  var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}

// Hide all the listings
function hideListings() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}

// This function takes in a color, and then creates a new marker icon of that color
function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21,34));
  return markerImage;
}
