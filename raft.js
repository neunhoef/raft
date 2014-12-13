////////////////////////////////////////////////////////////////////////////////
/// A JS implementation of Raft
/// by Max Neunhöffer
/// Copyright 2014, ArangoDB GmbH, Cologne, Germany
////////////////////////////////////////////////////////////////////////////////

(function () {
  "use strict";
  var Foxx = require("org/arangodb/foxx"),
      ArangoError = require("org/arangodb").ArangoError,
      log = require("console").log,
      controller = new Foxx.Controller(applicationContext);

  var logCollName = applicationContext.collectionName("log");
  var logColl = applicationContext.collection("log");
  var stateCollName = applicationContext.collectionName("state");
  var stateColl = applicationContext.collection("state");

  // Get an entry:
  controller.get('/getState', function (req, res) {
    log("getState called");
    var d;
    try {
      d = stateColl.document("root");
      res.json(d);
    }
    catch (e) {
      res.json(e);
    }
  });

  require("internal").registerTask( {
    id: "raft-heartbeat",
    name: "raft-heartbeat",
    offset: 0,
    period: 1.0,  // every second
    command: 'require("console").log("long live Raft")'
  } );
}());

