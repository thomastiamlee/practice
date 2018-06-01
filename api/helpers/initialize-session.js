const fs = require('fs');

module.exports = {
  friendlyName: 'Initialize a session.',
  description: 'Creates a log file for the session where all logs will be saved. This helper is called every time a user starts solving a problem.',
  inputs: {
    user_id: {
      type: 'string',
      description: 'The user ID',
      required: true
    }
  },
  fn: async function(inputs, exits) {
    await sails.helpers.createUserDataDirectory.with({user_id: inputs.user_id});
		var serverTimestamp = Date.now();
    var target = sails.config.custom.dataPath + '/' + inputs.user_id + '/sessions/' + serverTimestamp + '/';
    if (fs.existsSync(target)) {
      return exits.error('Attempted to create a session that already exists.');
    }
    else {
      fs.mkdirSync(target);
      fs.writeFileSync(target + 'log.txt', '[]', 'utf-8');
      fs.mkdirSync(target + 'snap');
      return exits.success(serverTimestamp);
    }
  }
}
