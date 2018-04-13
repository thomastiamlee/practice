const fs = require('fs');

module.exports = {
  friendlyName: 'Create user folder in temp directory',
  description: 'Create user folder in the temp directory if it does not exist',
  inputs: {
    user_id: {
      type: 'number',
      description: 'The user ID',
      required: true
    }
  },
  fn: async function(inputs, exits) {
    if (!fs.existsSync(sails.config.custom.tempPath + '/' + inputs.user_id)) {
      fs.mkdirSync(sails.config.custom.tempPath + '/' + inputs.user_id);
    }
    return exits.success();
  }
}
