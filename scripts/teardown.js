(function() {
  "use strict";

  var db = require("org/arangodb").db,
      logCollname = applicationContext.collectionName("log"),
      logCollection = db._collection(logCollname);
      stateCollname = applicationContext.collectionName("state"),
      stateCollection = db._collection(stateCollname);

  if (logCollection !== null) {
    logCollection.drop();
  }
  if (stateCollection !== null) {
    stateCollection.drop();
  }
}());
