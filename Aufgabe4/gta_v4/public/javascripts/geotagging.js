function GeoTag(latitude, longitude, name, hashtag) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.name = name;
    this.hashtag = hashtag;
}

$("#add-btn").click(function() {
    var ajax = new XMLHttpRequest();

    ajax.onreadystatechange = function() {
        if (ajax.readyState == 4) {
            genList(JSON.parse(ajax.response));
        }
    }
    ajax.open("POST", "/geotags", true);
    ajax.setRequestHeader("Content-Type", "application/json")
    ajax.send(JSON.stringify(new GeoTag(
        $("#latitude").val(),
        $("#longitude").val(),
        $("#name").val(),
        $("#hashtag").val()
    )));
});

$("#filter-btn").click(function() {
    var ajax = new XMLHttpRequest();

    ajax.onreadystatechange = function() {
        if (ajax.readyState == 4) {
            genList(JSON.parse(ajax.response));
        }
    }
    if ($("#searchterm").val()) {
        ajax.open("GET", `/geotags?search=${$("#searchterm").val()}`, true);
    } else {
        ajax.open("GET", `/geotags?lat=${$("#hidden-latitude").val()}&lon=${$("#hidden-longitude").val()}`, true);
    }
    ajax.send();
});

var genList = function(tags) {
    $("#results").html("");
    tags.forEach(tag => {
        $("#results").append(`<li>${tag.name} (${tag.latitude}, ${tag.longitude}) ${tag.hashtag}</li>`)
    });
}

/**
 * GeoTagApp Locator Modul
 */
var gtaLocator = (function GtaLocator() {
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

    // Hier MapQuest API Key eintragen
    var apiKey = "cXV1zzPXIMQ9PtruStvmB64S3f4AFNQn";

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
                }
            );

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
            $('#result-img').attr(
                "src",
                getLocationMapSrc($('#latitude').val(), $('#longitude').val(), tabList, 12)
            );
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