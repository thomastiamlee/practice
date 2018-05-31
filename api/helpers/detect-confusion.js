const fs = require('fs');

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
    var target = sails.config.custom.dataPath + '/' + inputs.user_id + '/' + inputs.session_id + '.txt';
    if (!fs.existsSync(target)) {
			exits.error({type: 'invalid', message: 'Invalid session ID'});
			return;
		}
    var history = JSON.parse(fs.readFileSync(target, 'utf-8'));

    function getRecentEvents(seconds, history) {
      var res = [];
      var milliseconds = seconds * 1000;
      for (var i = history.length - 1; i >= 0; i--) {
        var current = history[i].timestamp;
        if (serverTime - current > milliseconds) break;
        var type = history[i].type;
        if (type == 'document' || type == 'run_result' || type == 'submit_result') {
          res.unshift(history[i]);
        }
      }
      return res;
    }

    var recent = getRecentEvents(10, history);
    sails.log.info(recent);

    return exits.success(false);
  }
}
