var http = require("http");
var logger = require("morgan");
var bodyParser = require("body-parser");
var express = require("express");

var app = express();
app.use(logger("dev"));
app.use(bodyParser.json());

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

function GeoTag(latitude, longitude, name, hashtag) {
  this.id;
  this.latitude = latitude;
  this.longitude = longitude;
  this.name = name;
  this.hashtag = hashtag;
}

var GeoTags = (function GeoTags() {
  var tags = [];
  return {
    all: function() {
      return tags;
    },

    tagsInRadius: function(latitude, longitude, rad) {
      var filteredTags = [];
      tags.forEach(tag => {
        if (
          Math.abs(tag.latitude - latitude) <= rad &&
          Math.abs(tag.longitude - longitude) <= rad
        ) {
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
      tag.id = tags.length;
      tags.push(tag);
      return tag.id;
    },

    editTag: function(id, tag) {
      tags.forEach(function(e, i) {
        if (e.id == id) {
            tag.id = id;
            tags[i] = tag;
            return;
        }
      });
    },

    deleteTag: function(id) {
      var del = tags.splice(id, 1);
      console.log(del);
    }
  };
})();

app.get("/", function(req, res) {
  res.render("gta");
});

app.get("/geotags", function(req, res) {
  if (req.query.lat && req.query.lon) {
    res.json(GeoTags.tagsInRadius(req.query.lat, req.query.lon, 1));
    return;
  } else if (req.query.search) {
    res.json(GeoTags.search(req.query.search));
    return;
  }
  res.status(500).send("request must provide lat & lon or search parameter.");
});

app.post("/geotags", function(req, res) {
  var id = GeoTags.addTag(req.body);
  res
    .status(201)
    .set("Location", id)
    .json(GeoTags.all());
});

app.get("/geotag/:id", function(req, res) {
  var found = false;
  GeoTags.all().forEach(e => {
    if (e.id == req.params.id) {
      found = true;
      res.json(e);
    }
  });
  if (!found) {
    res.status(500).send("Tag-id " + req.params.id + " doesn't exist.");
  }
});

app.put("/geotag/:id", function(req, res) {
  GeoTags.editTag(req.params.id, req.body);
  res.status(201).send();
});

app.delete("/geotag/:id", function(req, res) {
  GeoTags.deleteTag(req.params.id);
  res.status(201).send();
});

var port = 3000;
app.set("port", port);
var server = http.createServer(app);
server.listen(port);
