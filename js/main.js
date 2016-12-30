var map;
// Create an array to hold markers
var markers = [];
// Initialize polygon to be used by drawingManager
var polygon = null;

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
    center: {lat: 41.8789, lng: -87.6359},
    zoom: 12,
    // Set styles for map
    styles: paleDawnStyles,
    // Disable ability to switch between map types
    mapTypeControl: false
  });

  // landmarks holds the music venue locations for all our markers
  var landmarks = [
    {title: 'Cloud Gate (The Bean)', location: {lat: 41.8827, lng: -87.6233}},
    {title: 'Buckingham Fountain', location: {lat: 41.8758, lng: -87.6189}},
    {title: 'Field Museum of Natural History', location: {lat: 41.8663, lng: -87.6170}},
    {title: 'Navy Pier', location: {lat: 41.8917, lng: -87.6063}},
    {title: 'Art Institute of Chicago', location: {lat: 41.8796, lng: -87.6237}},
    {title: 'Shedd Aquarium', location: {lat: 41.8676, lng: -87.6140}},
    {title: 'Willis Tower (Sears Tower)', location: {lat: 41.8789, lng: -87.6359}},
    {title: 'Wrigley Field', location: {lat: 41.9484, lng: -87.6553}},
    {title: 'Soldier Field', location: {lat: 41.8623, lng: -87.6167}},
    {title: 'United Center', location: {lat: 41.8807, lng: -87.6742}},
    {title: 'Guaranteed Rate Field (Comiskey)', location: {lat: 41.8299, lng: -87.6338}},
    {title: 'Lincoln Park Zoo', location: {lat: 41.9211, lng: -87.6340}}
  ];

  var largeInfoWindow = new google.maps.InfoWindow();

  // Initialize the drawing manager
  var drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.POLYGON,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_LEFT,
      drawingModes: [
        google.maps.drawing.OverlayType.POLYGON
      ]
    }
  });

  // Create default icon (red)
  var defaultIcon = makeMarkerIcon('FF0000');

  // Create a highlighted marker for when use mouses over (yellow)
  var highlightedIcon = makeMarkerIcon('FFFF24');

  // Create a list of markers based off landmarks array
  for (var i = 0; i < landmarks.length; i++) {
    // Get the position from landmarks array
    var position = landmarks[i].location;
    var title = landmarks[i].title;
    // Create a marker for each location, then push markers into an array
    var marker = new google.maps.Marker({
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
  // Create click events to hide/show landmarks
  document.getElementById('show-landmarks').addEventListener('click', showLandmarks);
  document.getElementById('hide-landmarks').addEventListener('click', hideLandmarks);

  // Create click event to turn on drawing tools
  document.getElementById('toggle-drawing').addEventListener('click', function() {
    toggleDrawing(drawingManager);
  });

  drawingManager.addListener('overlaycomplete', function(event) {
    // First, check if there is an existing polygon
    // If there is, get rid of it and remove the markers
    if (polygon) {
      polygon.setMap(null);
      hideLandmarks();
    }
    // Turn off drawing mode
    drawingManager.setDrawingMode(null);
    // Create a new editable polygon from the overlay
    polygon = event.overlay;
    polygon.setEditable(true);
    // Search within the polygon
    searchWithinPolygon();
    // Make sure the search is re-done if the poly is changed
    polygon.getPath().addListener('set_at', searchWithinPolygon);
    polygon.getPath().addListener('insert_at', searchWithinPolygon);
  });
} // end initMap()

// Add an event listener so that the polygon is captured, call the
// searchWithinPolygon function. This will show the markers in the polygon,
// and hide any outside of it


// This function populates the infoWindow when the marker is clicked
// Only allow one infoWindow which will open at the clicked marker,
// Populating window based on the marker's position
function populateInfoWindow(marker, infoWindow) {
  // First check to make sure infoWindow is not already opened on this marker
  if (infoWindow.marker != marker) {
    infoWindow.setContent('');
    infoWindow.marker = marker;

    // Make sure marker property is cleared if the infoWindow is closed
    infoWindow.addListener('closeclick', function() {
      infoWindow.marker = null;
    });

    // If status is OK, which means pano was found, compute the position of streetView
    // image, then calculate the heading, then get a panorama from that and
    // set the options
    function getStreetView(data, status) {
      if (status == google.maps.StreetViewStatus.OK) {
        var nearStreetViewLocation = data.location.latLng;

        // heading variable controls the initial pitch of streetview
        var heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLocation, marker.position);
        infoWindow.setContent('<div class="marker-title">' + marker.title + '</div><div id="pano"></div>');

        // Set the properties of streetview
        var panoramaOptions = {
          position: nearStreetViewLocation,
          pov: {
            heading: heading,
            pitch: 30
          }
        };
        // Create the streetview panorama that appears in the infoWindow
        var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);
      } else {
        infoWindow.setContent('<div>' + marker.title + '</div>' + '<div>No Street View Found</div>');
      }
    }

    var streetViewService = new google.maps.StreetViewService();
    var radius = 50;
    // Use streetview service to get closest streetview image within
    // 50 meters of the markers position
    streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
    // Open the infoWindow on the correct marker
    infoWindow.open(map, marker);
  }
}

function showLandmarks() {
  var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}

// Hide all the listings
function hideLandmarks() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}

// This function takes in a color, and then creates a new marker icon of that color
function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'https://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21,34));
  return markerImage;
}

// Turn on and off drawing mode when user clicks drawing mode button
function toggleDrawing(drawingManager) {
  if (drawingManager.map) {
    drawingManager.setMap(null);
    // In case the user drew anything, get rid of polygon
    if (polygon !== null) {
      polygon.setMap(null);
    }
  } else {
    drawingManager.setMap(map);
  }
}

// Show all markers within polygon and hide all other markers
function searchWithinPolygon() {
  for (var i = 0; i < markers.length; i++) {
    if (google.maps.geometry.poly.containsLocation(markers[i].position, polygon)) {
      markers[i].setMap(map);
    } else {
      markers[i].setMap(null);
    }
  }
}
