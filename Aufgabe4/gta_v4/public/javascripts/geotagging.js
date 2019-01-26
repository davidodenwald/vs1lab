$("#add-btn").click(function() {
    console.log("add a new location!");
});

$("#filter-btn").click(function() {
    console.log("filter locations!");
});

/**
 * GeoTagApp Locator Modul
 */
var gtaLocator = (function GtaLocator() {

    // Private Member

    /**
     * Funktion spricht Geolocation API an.
     * Bei Erfolg Callback 'onsuccess' mit Position.
     * Bei Fehler Callback 'onerror' mit Meldung.
     * Callback Funktionen als Parameter übergeben.
     */
    var tryLocate = function (onsuccess, onerror) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(onsuccess, function (error) {
                var msg;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        msg = "User denied the request for Geolocation.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        msg = "Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        msg = "The request to get user location timed out.";
                        break;
                    case error.UNKNOWN_ERROR:
                        msg = "An unknown error occurred.";
                        break;
                }
                onerror(msg);
            });
        } else {
            onerror("Geolocation is not supported by this browser.");
        }
    };

    // Auslesen Breitengrad aus der Position
    var getLatitude = function (position) {
        return position.coords.latitude;
    };

    // Auslesen Längengrad aus Position
    var getLongitude = function (position) {
        return position.coords.longitude;
    };

    // Hier MapQuest API Key eintragen
    var apiKey = "cXV1zzPXIMQ9PtruStvmB64S3f4AFNQn";

    /**
     * Funktion erzeugt eine URL, die auf die Karte verweist.
     * Falls die Karte geladen werden soll, muss oben ein API Key angegeben
     * sein.
     *
     * lat, lon : aktuelle Koordinaten (hier zentriert die Karte)
     * tags : Array mit Geotag Objekten, das auch leer bleiben kann
     * zoom: Zoomfaktor der Karte
     */
    var getLocationMapSrc = function (lat, lon, tags, zoom) {

        var tagList = "&locations=";
        if (tags !== undefined) tags.forEach(function(tag) {
            tagList += "||" + tag.latitude + "," + tag.longitude;
        });

        var urlString = "https://www.mapquestapi.com/staticmap/v5/map?key=" +
            apiKey + "&size=600,400" + "&zoom=" + zoom + "&center=" + lat + "," + lon + 
            tagList + "&defaultMarker=marker-md-3B5998-22407F";

        console.log("Generated Maps Url: " + urlString);
        return urlString;
    };

    return {
        updateLocation: function () {
            if (!$('#latitude').val() && !$('#longitude').val()) {
                tryLocate(
                    function (location) {
                        // fill fields in tagging form
                        $('#latitude').val(location.coords.latitude);
                        $('#longitude').val(location.coords.longitude);

                        // fill hidden fields of discovery form
                        $('#hidden-latitude').val(location.coords.latitude);
                        $('#hidden-longitude').val(location.coords.longitude);

                        $('#result-img').attr("src", getLocationMapSrc($('#latitude').val(), $('#longitude').val(), tabList, 12));

                    },
                    function (errorMsg) {
                        alert(errorMsg);
                    });
            }

            var tabList = [];
            $('#results').children().toArray().forEach(location => {
                var coords = location.innerHTML.match(/[0-9.]+/g);

                tabList.push({
                    'name': location.innerHTML.match(/^\w+/),
                    'latitude': coords[0],
                    'longitude': coords[1]
                });
            });

            // change default image
            $('#result-img').attr("src", getLocationMapSrc($('#latitude').val(), $('#longitude').val(), tabList, 12));
        }

    };
})();

/**
 * $(document).ready wartet, bis die Seite komplett geladen wurde. Dann wird die
 * angegebene Funktion aufgerufen. An dieser Stelle beginnt die eigentliche Arbeit
 * des Skripts.
 */
$(document).ready(function () {
    gtaLocator.updateLocation();
});