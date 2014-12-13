(function() {
  "use strict";

  var db = require("org/arangodb").db,
      logCollName = applicationContext.collectionName("log"),
      logCollection = db._collection(logCollName),
      stateCollName = applicationContext.collectionName("state"),
      stateCollection = db._collection(stateCollName);

  if (logCollection !== null) {
    logCollection.drop();
  }
  if (stateCollection !== null) {
    stateCollection.drop();
  }
}());
