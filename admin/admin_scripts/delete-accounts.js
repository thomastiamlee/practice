const fs = require('fs');
var MongoClient = require('mongodb').MongoClient;

const START_ID = 101;


MongoClient.connect("mongodb://localhost:27017", function (err, client) {
   if(err) throw err;
   var db = client.db('practice');

   //Write databse Insert/Update/Query code here..
   var collection = db.collection('account');
   collection.remove({user_id: { $gte: START_ID }});
   client.close();
});
