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

    // Hier Google Maps API Key eintragen
    var apiKey = "AIzaSyA59zKDmJYXDe3A75HLYwKbueBg5SbQdLY";

    /**
     * Funktion erzeugt eine URL, die auf die Karte verweist.
     * Falls die Karte geladen werden soll, muss oben ein API Key angegeben
     * sein.
     *
     * lat, lon : aktuelle Koordinaten (hier zentriert die Karte)
     * tags : Array mit Geotag Objekten, das auch leer bleiben kann
     * zoom: Zoomfaktor der Karte
     */
    var getLocationMapSrc = function (lat, lon, tags) {

        var tagList = "";
        if (typeof tags !== 'undefined') tags.forEach(function (tag) {
            tagList += "&markers=%7Clabel:" + tag.name +
                "%7C" + tag.latitude + "," + tag.longitude;
        });

        var urlString = "http://maps.googleapis.com/maps/api/staticmap?center=" +
            lat + "," + lon + "&markers=%7Clabel:you%7C" + lat + "," + lon +
            tagList + "&size=640x480&sensor=false&key=" + apiKey;

        return urlString;
    };

    return { // Start öffentlicher Teil des Moduls ...

        // Public Member

        readme: "Dieses Objekt enthält 'öffentliche' Teile des Moduls.",

        updateLocation: function () {
            tryLocate(
                function (location) {
                    // fill fields in tagging form
                    $('#latitude').val(location.coords.latitude);
                    $('#longitude').val(location.coords.longitude);

                    // fill hidden fields of discovery form
                    $('#hidden-latitude').val(location.coords.latitude);
                    $('#hidden-longitude').val(location.coords.longitude);

                    var tabList = [];
                    $('#results').children().toArray().forEach(location => {
                        var coords = location.innerHTML.match(/[0-9.]+/g);

                        tabList.push({
                            'name': location.innerHTML.match(/^\w+/),
                            'latitude': coords[0],
                            'longitude': coords[1]
                        });
                    });
                    // change default image to google-maps map
                    $('#result-img').attr("src", getLocationMapSrc(location.coords.latitude, location.coords.longitude, tabList));
                },
                function (errorMsg) {
                    alert(errorMsg);
                });
        }

    }; // ... Ende öffentlicher Teil
})();

/**
 * $(document).ready wartet, bis die Seite komplett geladen wurde. Dann wird die
 * angegebene Funktion aufgerufen. An dieser Stelle beginnt die eigentliche Arbeit
 * des Skripts.
 */
$(document).ready(function () {
    gtaLocator.updateLocation();
});