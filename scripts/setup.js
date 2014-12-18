(function() {
  "use strict";
  var console = require("console"),
      db = require("org/arangodb").db,
      logCollName = applicationContext.collectionName("log"),
      stateCollName = applicationContext.collectionName("state");

  if (db._collection(logCollName) === null) {
    var c = db._create(logCollName);
  } else if (applicationContext.isProduction) {
    console.warn("collection '%s' already exists. Leaving it untouched.", 
                 logCollName);
  }
  if (db._collection(stateCollName) === null) {
    var c = db._create(stateCollName);
    c.insert( { "_key": "root",
                "ownId": 0,
                "state": "BOOT",
                "currentTerm": 1,
                "votedFor": 0,
                "commitIndex": 0,
                "lastApplied": 0,
                "lastHeartBeatSeen": 0,
                "lastLogEntry": 0,
                "lastLogTerm": 0,
                "servers": [] } );
  } else if (applicationContext.isProduction) {
    console.warn("collection '%s' already exists. Leaving it untouched.", 
                 stateCollName);
  }
}());
