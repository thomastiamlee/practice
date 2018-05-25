const fs = require('fs');

module.exports = {
  friendlyName: 'Write code to file',
  description: 'Write code to a file in preparation for compilation',
  inputs: {
    code: {
      type: 'string',
      description: 'The code containing the Java class to be saved (must have a class name of Main)',
      required: true
    },
    user_id: {
      type: 'string',
      description: 'The user ID who made the submission',
      required: true
    },
    problem_id: {
      type: 'string',
      description: 'The problem ID for which the submission is made',
      required: true
    }
  },
  fn: async function(inputs, exits) {
    await sails.helpers.createUserTempDirectory.with({user_id: inputs.user_id});
    try {
      fs.writeFileSync(sails.config.custom.tempPath + '/' + inputs.user_id + '/Main.java', inputs.code, 'utf-8');
    } catch(err) {
      return exits.error(err);
    }
    return exits.success();
  }
}
