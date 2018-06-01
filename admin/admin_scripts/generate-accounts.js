const fs = require('fs');
var MongoClient = require('mongodb').MongoClient;

// Connect to the db
var numList =

MongoClient.connect("mongodb://localhost:27017", function (err, client) {
   if(err) throw err;
   var db = client.db('practice');

   //Write databse Insert/Update/Query code here..
   db.collection('account', function (err, collection) {
     
     client.close();
   });
});
