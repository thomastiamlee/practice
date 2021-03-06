const fs = require('fs');
const compile_run = require('compile-run');
const classifer_path = 'api/app_modules/classifier/classifier.py';
const classifer_au_path = 'api/app_modules/classifier/classifierau.py';

module.exports = {
  friendlyName: 'Detect confusion',
  description: 'This helper calls the external Python classifier for detecting confusion based on recent log data',
  inputs: {
    user_id: {
      type: 'string',
      description: 'The user ID',
      required: true
    },
    session_id: {
      type: 'string',
      description: 'The ID assigned to this session (this is different from the session ID of the account)',
      required: true
    }
  },
  fn: async function(inputs, exits) {
    var serverTime = Date.now();
    var interval = 30;
    var target = sails.config.custom.dataPath + '/' + inputs.user_id + '/sessions/' + inputs.session_id + '/';
    if (!fs.existsSync(target)) {
			exits.error({type: 'invalid', message: 'Invalid session ID'});
			return;
		}
    var history = JSON.parse(fs.readFileSync(target + 'log.txt', 'utf-8'));

    function getRecentEvents(seconds, history) {
      var res = [];
      var milliseconds = seconds * 1000;
      for (var i = history.length - 1; i >= 0; i--) {

        var current = history[i].timestamp;

        if (serverTime - current > milliseconds) break;
        var type = history[i].type;
        if (type == 'document' || type == 'run_result' || type == 'submit_result' || type == 'au') {
          res.unshift(history[i]);
        }
      }
      return res;
    }

    /* Current model used */
    /* [none, insert, remove, both, compile error, submit fail, compile no error] */
    function convertToHMMSequence(interval, recent) {
      var start = serverTime - (interval * 1000);

      var information = [];
      for (var i = 0; i < interval; i++) {
        information.push({
          insert: false,
          remove: false,
          compile: false,
          compileError: false,
          submitFailed: false
        })
      }
      var auFound = false;
      for (var i = 0; i < recent.length; i++) {
        var past = interval - Math.floor((serverTime - recent[i].timestamp) / 1000);
        if (past >= interval) past = interval - 1;
        if (past < 0) past = 0;

        if (recent[i].type == 'document') {
          if (recent[i].changeObj.origin == '+input') {
            information[past].insert = true;
          }
          else if (recent[i].changeObj.origin == '+remove') {
            information[past].remove = true;
          }
        }
        else if (recent[i].type == 'run_result') {
          if (recent[i].verdict == 'no error') {
            information[past].compile = true;
          }
          else {
            information[past].compileError = true;
          }
        }
        else if (recent[i].type == 'submit_result') {
          if (recent[i].verdict == 'fail') {
            information[past].submitFailed = true;
          }
        }
        else if (recent[i].type == 'au') {
          auFound = true;
          if (recent[i].au.mouthOpen >= 90) {
            information[past].mouthOpen = true;
          }
          if (recent[i].au.eyeWiden >= 90) {
            information[past].eyeWiden = true;
          }
          if (recent[i].au.browFurrow >= 90) {
            information[past].browFurrow = true;
          }
        }
      }

      var res = '';
      var resBF = '';
      var resEW = '';
      var resMO = '';
      for (var i = 0; i < information.length; i++) {
        var current = information[i];
        var state = -1;

        if (current.submitFailed) {
          state = 5;
        }
        else if (current.compileError) {
          state = 3;
        }
        else if (current.compile) {
          state = 4;
        }
        else if (current.remove) {
          state = 2;
        }
        else if (current.insert) {
          state = 1;
        }
        else {
          state = 0;
        }
        if (state > 0) {
          res += state;
          resBF += state;
          resEW += state;
          resMO += state;
        }
        else {
          res += '0';
          if (current.mouthOpen) {
            resMO += '6';
          }
          else {
            resMO += '0';
          }
          if (current.eyeWiden) {
            resEW += '6';
          }
          else {
            resEW += '0';
          }
          if (current.browFurrow) {
            resBF += '6';
          }
          else {
            resBF += '0';
          }
        }

        if (i != information.length - 1) {
          res += ',';
          resMO += ',';
          resEW += ',';
          resBF += ',';
        }
      }
      return {auFound: auFound, res: res, resMO: resMO, resEW: resEW, resBF};
    }

    var recent = getRecentEvents(interval, history);
    var sequence = convertToHMMSequence(interval, recent);
    if (sequence == null) {
      return exits.success(false);
    }
    else {
      var completed = false;

      if (sequence.auFound == false) {
        if (sequence.res == null) {
          return exits.success(false);
        }
        // Run classifier program
        compile_run.runFile(classifer_path, sequence.res, function (stdout, stderr, err) {
          completed = true;
          sails.log.info(stdout);
          sails.log.info(stderr);
          if(!err){
            try {
              var verdict = stdout.trim();
            }
            catch (error) {
              return exits.success(false);
            }
            if (verdict == 'yes') {
              return exits.success(true);
            }
            else {
              return exits.success(false);
            }
          }
          else{
            return exits.success(false);
          }
        });
      }
      else {
        if (sequence.res == null) {
          return exits.success(false);
        }
        // Run classifier program
        compile_run.runFile(classifer_au_path, sequence.resBF + '\n' + sequence.resEW + '\n' + sequence.resMO, function (stdout, stderr, err) {
          completed = true;
          sails.log.info(stdout);
          sails.log.info(stderr);
          if(!err){
            try {
              var verdict = stdout.trim();
            }
            catch (error) {
              return exits.success(false);
            }
            if (verdict == 'yes') {
              return exits.success(true);
            }
            else {
              return exits.success(false);
            }
          }
          else{
            return exits.success(false);
          }
        });
      }

      setTimeout(function() {
        if (!completed) {
          return exits.error({type: 'invalid', message: 'Error in detecting confusion'});
        }
        else {
          return;
        }
      }, 10000);
    }

  }
}
