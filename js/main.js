var map;
// Create an array to hold markers
var markers = [];
// Initialize polygon to be used by drawingManager
var polygon = null;

// Create placemarkers array to use in multiple functions
// to have control over the number of places that show
var placeMarkers = [];

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

  // This autocomplete is for use in the search within time entry box
  var timeAutocomplete = new google.maps.places.Autocomplete(
    document.getElementById('search-within-time-text'));

  // This autocomplete is for use in the geocoder entry box
  var zoomAutocomplete = new google.maps.places.Autocomplete(
    document.getElementById('zoom-to-area-text'));
  zoomAutocomplete.bindTo('bounds', map);

  // Create a searchbox in order to execute a places search
  var searchBox = new google.maps.places.SearchBox(
    document.getElementById('places-search'));
  // Bias the searchbox to within the bounds of the map
  searchBox.setBounds(map.getBounds());

  // landmarks holds the music venue locations for all our markers
  var landmarks = [
    {title: 'Cloud Gate (The Bean)', location: {lat: 41.8827, lng: -87.6233}},
    {title: 'Buckingham Fountain', location: {lat: 41.8758, lng: -87.6189}},
    {title: 'Field Museum of Natural History', location: {lat: 41.8663, lng: -87.6170}},
    {title: 'Museum of Science and Industry', location: {lat: 41.7906, lng: -87.5830}},
    {title: 'Navy Pier', location: {lat: 41.8917, lng: -87.6063}},
    {title: 'Art Institute of Chicago', location: {lat: 41.8796, lng: -87.6237}},
    {title: 'Shedd Aquarium', location: {lat: 41.8676, lng: -87.6140}},
    {title: 'Adler Planetarium', location: {lat: 41.8663, lng: -87.6068}},
    {title: 'Willis Tower (Sears Tower)', location: {lat: 41.8789, lng: -87.6359}},
    {title: 'Wrigley Field', location: {lat: 41.9484, lng: -87.6553}},
    {title: 'Soldier Field', location: {lat: 41.8623, lng: -87.6167}},
    {title: 'United Center', location: {lat: 41.8807, lng: -87.6742}},
    {title: 'Guaranteed Rate Field (Comiskey)', location: {lat: 41.8299, lng: -87.6338}},
    {title: 'Water Tower Place', location: {lat: 41.8979, lng: -87.6229}},
    {title: 'Crown Fountain', location: {lat: 41.8815, lng: -87.6237}},
    {title: 'McCormick Place', location: {lat: 41.8512, lng: -87.6170}},
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
  document.getElementById('hide-landmarks').addEventListener('click', hideMarkers);

  // Create click event to turn on drawing tools
  document.getElementById('toggle-drawing').addEventListener('click', function() {
    toggleDrawing(drawingManager);
  });

  document.getElementById('zoom-to-area').addEventListener('click', function() {
    zoomToArea();
  });

  document.getElementById('search-within-time').addEventListener('click', function() {
    searchWithinTime();
  });

  // Listen for event fired when user selects a prediction from the picklist
  // and retrieve more details for that place
  searchBox.addListener('places_changed', function() {
    searchBoxPlaces(this);
  });

  // Listen for the event fired when the user selects a prediction and when user clicks
  // "Go" give more details for that place
  document.getElementById('go-places').addEventListener('click', textSearchPlaces);


  document.getElementById('refresh').addEventListener('click', refreshPage);

  drawingManager.addListener('overlaycomplete', function(event) {
    // First, check if there is an existing polygon
    // If there is, get rid of it and remove the markers
    if (polygon) {
      polygon.setMap(null);
      hideMarkers();
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
            pitch: 10
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
function hideMarkers() {
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

// Locate the input value and zoom into that area
function zoomToArea() {
  // Initialize the geocoder
  var geocoder = new google.maps.Geocoder();
  // Get the address or place that the user entered
  var address = document.getElementById('zoom-to-area-text').value;
  // Make sure address is not blank
  if (address === '') {
    window.alert('You must enter an area, or address.');
  } else {
    // Geocode the address entered to get the center. Then center the map
    // and zoom in on this area
    geocoder.geocode(
      { address : address,
        componentRestrictions: {locality: 'Chicago'}
      }, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          map.setCenter(results[0].geometry.location);
          map.setZoom(15);
        } else {
          window.alert('We could not find that location - try entering a more' +
            ' specific place.');
        }
      });
  }
}

// Allow the user to input a desired travel time, in minutes, and a travel mode,
// and a location - and only show the landmarks that are within that travel time
// (via that travel mode) of the location
function searchWithinTime() {
  // Initialize the distance matrix service
  var distanceMatrixService = new google.maps.DistanceMatrixService;
  var address = document.getElementById('search-within-time-text').value;
  // Check to make sure the place entered is not blank
  if (address === '') {
    window.alert('You must enter an address.');
  } else {
    hideMarkers();
    // Use the distance matrix service to calculate the duration of the routes between
    // all our markers, and the destination address entered by the user. Then put
    // all the origins into an origin matrix
    var origins = [];
    for (var i = 0; i < markers.length; i++) {
      origins[i] = markers[i].position;
    }
    var destination = address;
    var mode = document.getElementById('mode').value;
    // Now that both origins and destination are defined, get all the
    // info for the distances between them
    distanceMatrixService.getDistanceMatrix({
      origins: origins,
      destinations: [destination],
      travelMode: google.maps.TravelMode[mode],
      unitSystem: google.maps.UnitSystem.IMPERIAL,
    }, function(response, status) {
      if (status !== google.maps.DistanceMatrixStatus.OK) {
        window.alert('Error was: ' + status);
      } else {
        displayMarkersWithinTime(response);
      }
    })
  }
}

// Go through each of the results from searchWithinTime() and if the distance
// is less than the value in the picker, show it on the map
function displayMarkersWithinTime(response) {
  var maxDuration = document.getElementById('max-duration').value;
  var origins = response.originAddresses;
  var destinations = response.destinationAddresses;
  // Parse through the results, and get the distance and duration of each
  // Because there might be multiple origins and destinations we have a nested loop
  // Then, make sure at least one result was found
  var atLeastOne = false;
  for (var i = 0; i < origins.length; i++) {
    var results = response.rows[i].elements;
    for (var j = 0; j < results.length; j++) {
      var element = results[j];
      if (element.status === 'OK') {
        // The distance returned is in feet, but the text is in miles. To switch
        // the function to show markers within a user-entered distance, we would need
        // the value for the distance, but for now we only need the text
        var distanceText = element.distance.text;
        // Convert distance duration value from seconds to minutes
        // Get duration value and text
        var duration = element.duration.value / 60;
        var durationText = element.duration.text;
        if (duration <= maxDuration) {
          // The origin [i] should equal the markers[i]
          markers[i].setMap(map);
          atLeastOne = true;
          // Create a mini infoWindow to open immediately & contain distance & duration
          var infoWindow = new google.maps.InfoWindow({
            content: durationText + ' away, ' + distanceText +
            '<div><input type=\"button\" value=\"View Route\" onclick=' +
            '\"displayDirections(&quot;' + origins[i] + '&quot;);\"></input></div>'
          });
          infoWindow.open(map, markers[i]);
          // Close small window if user clicks the marker, when big infoWindow opens
          markers[i].infoWindow = infoWindow;
          google.maps.event.addListener(markers[i], 'click', function() {
            this.infoWindow.close();
          });
        }
      }
    }
  }
  if (!atLeastOne) {
    window.alert('We could not find any locations within that distance!');
  }
}

// When user clicks show route on one for the markers, this function will display
// the route on the map
function displayDirections(origin) {
  hideMarkers();
  var directionsService = new google.maps.DirectionsService;
  // Get the destination address from the use entered value
  var destinationAddress = document.getElementById('search-within-time-text').value;
  var mode = document.getElementById('mode').value;
  directionsService.route({
    // The origin is the marker's position
    origin: origin,
    // The destination is the user's entered address
    destination: destinationAddress,
    travelMode: google.maps.TravelMode[mode]
  }, function(response, status) {
    if (status === google.maps.DirectionsStatus.OK) {
      var directionsDisplay = new google.maps.DirectionsRenderer({
        map: map,
        directions: response,
        draggable: true,
        polylineOptions: {
          strokeColor: 'green'
        }
      });
    } else {
      window.alert('Directions request failed due to' + status);
    }
  })
}

// Called when the user selects a searchbox picklist item
// It will do a nearby search using the selected query string or place
function searchBoxPlaces(searchBox) {
  hideMarkers(placeMarkers);
  var places = searchBox.getPlaces();
  // For each place, get the icon, name and location
  createMarkersForPlaces(places);
  if (places.length == 0) {
    window.alert('We did not find any places match that search!');
  }
}

// Fires when the user selects "Go" on the places search
// It will do a nearby search using the entered query string or place
function textSearchPlaces() {
  var bounds = map.getBounds();
  hideMarkers(placeMarkers);
  var placesService = new google.maps.places.PlacesService(map);
  placesService.textSearch({
    query: document.getElementById('places-search').value,
    bounds: bounds
  }, function(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      createMarkersForPlaces(results);
    }
  });
}

// This function creates markers for each place found in either places search
function createMarkersForPlaces(places) {
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < places.length; i++) {
    var place = places[i];
    var icon = {
      url: place.icon,
      size: new google.maps.Size(35, 35),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(15, 34),
      scaledSize: new google.maps.Size(25, 25)
    };
    // Create a marker for each place
    var marker = new google.maps.Marker({
      map: map,
      icon: icon,
      title: place.name,
      position: place.geometry.location,
      id: place.place_id
    });
    // Create a single infoWindow to be used with the place details information
    // so that only one is open at once
    var placeInfoWindow = new google.maps.InfoWindow();
    // If a marker is clicked, do a place details search on it in the next function
    marker.addListener('click', function() {
      if (placeInfoWindow.marker == this) {
        console.log("This infoWindow already is on this marker!");
      } else {
        getPlaceDetails(this, placeInfoWindow);
      }
    });
    placeMarkers.push(marker);
    if (place.geometry.viewport) {
      // Only geocodes have viewport.
      bounds.union(place.geometry.viewport);
    } else {
      bounds.extend(place.geometry.location);
    }
  }
  map.fitBounds(bounds);
}
// PLACE DETAILS is only executed when a marker is selected,
// indicating the user wants more details about that place
function getPlaceDetails(marker, infoWindow) {
  var service = new google.maps.places.PlacesService(map);
  service.getDetails({
    placeId: marker.id
  }, function(place, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      // Set the marker property on this infoWindow so it isn't created again
      infoWindow.marker = marker;
      var innerHTML = '<div>';
      if (place.name) {
        innerHTML += '<strong>' + place.name + '</strong>';
      }
      if (place.formatted_address) {
        innerHTML += '<br>' + place.formatted_address;
      }
      if (place.formatted_phone_number) {
        innerHTML += '<br>' + place.formatted_phone_number;
      }
      if (place.opening_hours) {
        innerHTML += '<br><br><strong>Hours:</strong><br>' +
          place.opening_hours.weekday_text[0] + '<br>' +
          place.opening_hours.weekday_text[1] + '<br>' +
          place.opening_hours.weekday_text[2] + '<br>' +
          place.opening_hours.weekday_text[3] + '<br>' +
          place.opening_hours.weekday_text[4] + '<br>' +
          place.opening_hours.weekday_text[5] + '<br>' +
          place.opening_hours.weekday_text[6];
        }
      if (place.photos) {
        innerHTML += '<br><br><img src="' + place.photos[0].getUrl(
          {maxHeight: 100, maxWidth: 200}) + '">';
        }
      innerHTML += '</div>';
      infoWindow.setContent(innerHTML);
      infoWindow.open(map, marker);
      // Make sure the marker property is cleared if the infoWindow is closed
      infoWindow.addListener('closeclick', function() {
      infoWindow.marker = null;
      });
    }
  });
}

function refreshPage() {
  window.location.reload();
}
