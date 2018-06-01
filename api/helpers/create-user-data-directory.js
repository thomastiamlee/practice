const fs = require('fs');

module.exports = {
  friendlyName: 'Create user folder in data directory',
  description: 'Create user folder in the data directory if it does not exist',
  inputs: {
    user_id: {
      type: 'string',
      description: 'The user ID',
      required: true
    }
  },
  fn: async function(inputs, exits) {
    if (!fs.existsSync(sails.config.custom.dataPath + '/' + inputs.user_id)) {
      fs.mkdirSync(sails.config.custom.dataPath + '/' + inputs.user_id);
    }
    if (!fs.existsSync(sails.config.custom.dataPath + '/' + inputs.user_id + '/' + 'syntax')) {
      fs.mkdirSync(sails.config.custom.dataPath + '/' + inputs.user_id + '/' + 'syntax');
    }
    if (!fs.existsSync(sails.config.custom.dataPath + '/' + inputs.user_id + '/' + 'sessions')) {
      fs.mkdirSync(sails.config.custom.dataPath + '/' + inputs.user_id + '/' + 'sessions');
    }
    return exits.success();
  }
}
