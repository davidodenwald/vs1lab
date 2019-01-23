/**
 * Template für Übungsaufgabe VS1lab/Aufgabe3
 * Das Skript soll die Serverseite der gegebenen Client Komponenten im
 * Verzeichnisbaum implementieren. Dazu müssen die TODOs erledigt werden.
 */

/**
 * Definiere Modul Abhängigkeiten und erzeuge Express app.
 */

var http = require('http');
var logger = require('morgan');
var bodyParser = require('body-parser');
var express = require('express');

var app;
app = express();
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));

// Setze ejs als View Engine
app.set('view engine', 'ejs');

/**
 * Konfiguriere den Pfad für statische Dateien.
 * Teste das Ergebnis im Browser unter 'http://localhost:3000/'.
 */
app.use(express.static(__dirname + "/public"));

/**
 * Konstruktor für GeoTag Objekte.
 * GeoTag Objekte sollen min. alle Felder des 'tag-form' Formulars aufnehmen.
 */

function GeoTag(latitude, longitude, name, hashtag) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.name = name;
    this.hashtag = hashtag;
}

/**
 * Modul für 'In-Memory'-Speicherung von GeoTags mit folgenden Komponenten:
 * - Array als Speicher für Geo Tags.
 * - Funktion zur Suche von Geo Tags in einem Radius um eine Koordinate.
 * - Funktion zur Suche von Geo Tags nach Suchbegriff.
 * - Funktion zum hinzufügen eines Geo Tags.
 * - Funktion zum Löschen eines Geo Tags.
 */

var GeoTags = (function GeoTags() {
    var tags = [];
    return {
        tagsInRadius: function(latitude, longitude, rad) {
            var filteredTags = [];
            tags.forEach(tag => {
                if (Math.abs(tag.latitude - latitude) <= rad && Math.abs(tag.longitude - longitude) <= rad) {
                    filteredTags.push(tag);
                }
            });
            return filteredTags;
        },

        search: function(query) {
            var filteredTags = [];
            tags.forEach(tag => {
                if (tag.name.toLowerCase().includes(query.toLowerCase())) {
                    filteredTags.push(tag);
                }
            });
            return filteredTags;
        },
        
        addTag: function(tag) {
            tags.push(tag);
        },
        
        deleteTag: function(tag) {
            tags.slice(tags.indexOf(tag), 1);
        }
    }
})();

/**
 * Route mit Pfad '/' für HTTP 'GET' Requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests enthalten keine Parameter
 *
 * Als Response wird das ejs-Template ohne Geo Tag Objekte gerendert.
 */

app.get('/', function(req, res) {
    res.render('gta', {
        taglist: [],
        latitude: "",
        longitude: ""
    });
});

/**
 * Route mit Pfad '/tagging' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'tag-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Mit den Formulardaten wird ein neuer Geo Tag erstellt und gespeichert.
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 */

app.post('/tagging', function(req, res) {
    GeoTags.addTag(new GeoTag(req.body.latitude, req.body.longitude, req.body.name, req.body.hashtag));
    res.render('gta', {
        taglist: GeoTags.tagsInRadius(req.body.latitude, req.body.longitude, 1),
        latitude: req.body.latitude,
        longitude: req.body.longitude
    });
});

/**
 * Route mit Pfad '/discovery' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'filter-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 * Falls 'term' vorhanden ist, wird nach Suchwort gefiltert.
 */

app.post('/discovery', function(req, res) {
    if (req.body.searchterm) {
        res.render('gta', {
            taglist: GeoTags.search(req.body.searchterm),
            latitude: req.body.latitude,
            longitude: req.body.longitude
        });
    } else {
        res.render('gta', {
            taglist: GeoTags.tagsInRadius(req.body.latitude, req.body.longitude, 1),
            latitude: req.body.latitude,
            longitude: req.body.longitude
        })
    }
});

/**
 * Setze Port und speichere in Express.
 */

var port = 3000;
app.set('port', port);

/**
 * Erstelle HTTP Server
 */

var server = http.createServer(app);

/**
 * Horche auf dem Port an allen Netzwerk-Interfaces
 */

server.listen(port);