var geocoder;
var isReady = false;

initMap = function() {
  isReady = true;
  geocoder = new google.maps.Geocoder();
};

function geocodeAddress(address, cb) {
  if(!isReady) return null;

  geocoder.geocode({'address': address}, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      if(cb) cb(results);
    } else {
      if(cb) cb(null);
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

function reverseGeocodeAddress(location, cb) {
  if(!isReady) return null;

  geocoder.geocode({'location': location}, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      if(cb) cb(results);
    } else {
      if(cb) cb(null);
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}
