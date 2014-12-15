////////////////////////////////////////////////////////////////////////////////
/// A JS implementation of Raft
/// by Max Neunhöffer
/// Copyright 2014, ArangoDB GmbH, Cologne, Germany
////////////////////////////////////////////////////////////////////////////////

// The following function is executed regularly, it does not have
// access to anything in the Foxx app except the collections via the
// names stateCollName and logCollName which are assigned as variables
// in the context where this function is parsed.

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

  var raftQueue = Foxx.queues.create("raft");

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
  controller.post('/newServer', function (req, res) {
    var body = req.body();
    log("newFollower called: " + JSON.stringify(body));
    var state = stateColl.document("root");
    state.servers.push(body.endpoint);
    stateColl.replace(state, state);
    res.json({error:false});
  } );
    
  // Start service:
  controller.post('/start', function (req, res) {
    var body = req.body();
    log("start called: " + JSON.stringify(body));
    var state = stateColl.document("root");
    state.state = "FOLLOWER";
    stateColl.replace(state, state);
    res.json({error:false});
  } );
    
  var heartBeat = function (number) {
    var state = stateColl.document("root");
    log("Heartbeat "+number+":" + JSON.stringify(state));
    raftQueue.push("raft-heartbeat", number+1, 
                   { delayUntil: Date.now() + 3000 });
  };

  Foxx.queues.registerJobType("raft-heartbeat", heartBeat);
  log("Cleaning out queue...");
  var l = raftQueue.all();
  for (var i = 0; i < l.length; i++) {
    raftQueue.delete(l[i]);
  }
  log("Scheduling job 1");
  raftQueue.push("raft-heartbeat", 1, { delayUntil: Date.now() + 3000 });
}());

