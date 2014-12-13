(function() {
  "use strict";
  var console = require("console"),
      db = require("org/arangodb").db,
      logCollname = applicationContext.collectionName("log");
      stateCollname = applicationContext.collectionName("state");

  if (db._collection(logCollname) === null) {
    var c = db._create(logCollname);
  } else if (applicationContext.isProduction) {
    console.warn("collection '%s' already exists. Leaving it untouched.", 
                 logCollname);
  }
  if (db._collection(stateCollname) === null) {
    var c = db._create(stateCollname);
    c.insert( { "_key": "root",
                "state": "BOOT",
                "term": 1,
                "index": 0,
                "servers": [] } );
  } else if (applicationContext.isProduction) {
    console.warn("collection '%s' already exists. Leaving it untouched.", 
                 stateCollname);
  }
}());
