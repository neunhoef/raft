////////////////////////////////////////////////////////////////////////////////
/// A JS implementation of Raft
/// by Max Neunhöffer
/// Copyright 2014, ArangoDB GmbH, Cologne, Germany
////////////////////////////////////////////////////////////////////////////////

// The following function is executed regularly, it does not have
// access to anything in the Foxx app except the collections via the
// names stateCollName and logCollName which are assigned as variables
// in the context where this function is parsed.

function heartBeat() {
  var db = require("internal").db;
  var stateColl = db._collection(stateCollName);
  var logColl = db._collection(logCollName);
  var state = stateColl.document("root");
}

(function () {
  "use strict";
  var Foxx = require("org/arangodb/foxx"),
      ArangoError = require("org/arangodb").ArangoError,
      log = require("console").log,
      controller = new Foxx.Controller(applicationContext),
      internal = require("internal");

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

  // Answer to request vote RPC:
  controller.put('/requestVote', function (req, res) {
    var body = req.body();
    log("requestVote called: " + JSON.stringify(body));
  } );

  // Answer to append to log RPC:
  controller.put('/appendLog', function (req, res) {
    var body = req.body();
    log("appendLog called: " + JSON.stringify(body));
  } );

  // Register a new follower in BOOT phase, as soon as the cluster is
  // complete we start:
  controller.post('/newFollower', function (req, res) {
    var body = req.body();
    log("newFollower called: " + JSON.stringify(body));
  } );
    
  try {
    internal.unregisterTask("raft-heartbeat");
  }
  catch (e) {
  }
  require("internal").registerTask( {
    id: "raft-heartbeat",
    name: "raft-heartbeat",
    offset: 0,
    period: 1.0,  // every second
    command: "var stateCollName = '" + stateCollName + "';" +
             "var logCollName = '" + logCollName + "';" +
             "(" + heartBeat.toString() + ")();"
  } );
  log("Have registered task raft-heartbeat");
}());

