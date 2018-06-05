const fs = require('fs');
var MongoClient = require('mongodb').MongoClient;

const ADAPTIVE_TARGET = 'adaptive.txt';
const PLAIN_TARGET = 'plain.txt';
const START_ID = 101;
const REGION = 'jp';

// Connect to the db
var adaptive = fs.readFileSync(ADAPTIVE_TARGET, 'utf-8').split('\n');
var plain = fs.readFileSync(PLAIN_TARGET, 'utf-8').split('\n');

MongoClient.connect("mongodb://localhost:27017", function (err, client) {
   if(err) throw err;
   var db = client.db('practice');

   //Write databse Insert/Update/Query code here..
   var collection = db.collection('account');
   var id = START_ID;
   for (var i = 0; i < adaptive.length; i++) {
     if (adaptive[i].trim() == '') continue;
     var current = adaptive[i].split(' ');
     var email = current[0];
     var password = current[1];
		 var userId = parseInt(current[2].trim());

     var user = {
       email: email,
       password: password,
       user_id: userId,
       region: REGION,
       syntax_solved: 0,
       current_syntax_problem: -1,
       group: 'adaptive',
			 agreement: 'no'
     };
     collection.insert(user);
     id++;
   }

   for (var i = 0; i < plain.length; i++) {
     if (plain[i].trim() == '') continue;
     var current = plain[i].split(' ');
     var email = current[0];
     var password = current[1];
		 var userId = parseInt(current[2].trim());

     var user = {
       email: email,
       password: password,
       user_id: userId,
       region: REGION,
       syntax_solved: 0,
       current_syntax_problem: -1,
       group: 'plain',
			 agreement: 'no'
     };
     collection.insert(user);
     id++;
   }

   client.close();
});
