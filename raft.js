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

  // Initialisation:
  controller.post('/init', function (req, res) {
    var body = req.body();
    log("/init called: " + JSON.stringify(body));
    var state = stateColl.document("root");
    state.servers = body.servers;
    state.ownId = body.id;
    stateColl.replace(state, state);
    res.json({error:false});
  } );

  // Startup:
  controller.get('/start', function (req, res) {
    log("/start called.");
    var state = stateColl.document("root");
    state.state = "FOLLOWER";
    state.lastHeartBeatSeen = Date.now();
    stateColl.replace(state, state);
    res.json({error:false});
    
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

  var heartBeat = function (number) {
    var state = stateColl.document("root");
    log("Heartbeat "+number+":" + JSON.stringify(state));
    if (state.state !== "BOOT") {
      if (state.state === "FOLLOWER" && 
          Date.now() >= state.lastHeartBeatSeen + 10000) {
        state.state = "CANDIDATE";
        state.currentTerm = state.currentTerm + 1;
        stateColl.replace(state, state);
        for (i = 0; i < state.servers.length; i++) {
          var server = state.servers[i];
          var x = internal.download(server+"/requestVote",
                                    { term: state.currentTerm,
                                      candidateId: state.ownId,
                                      lastLogEntry: state.lastLogEntry,
                                      lastLogTerm: state.lastLogTerm });
        }
      }
    }
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

