const fs = require('fs');

module.exports = {
  friendlyName: 'Write information of generated syntax exercise',
  description: 'This writes information of a generated syntax exercise and assigns it a problem ID, so the system can check it later on.',
  inputs: {
    user_id: {
      type: 'string',
      description: 'The user ID',
      required: true
    },
    exercise_text: {
      type: 'string',
      description: 'The text of the generated exercise',
      required: true
    },
    argument_types: {
      type: ['string'],
      description: 'The data types of the function arguments',
      required: true
    },
    argument_names: {
      type: ['string'],
      description: 'The names of the function arguments',
      required: true
    },
    test_case_inputs: {
      type: ['string'],
      description: 'The inputs of the test cases',
      required: true
    },
    test_case_outputs: {
      type: ['string'],
      description: 'The outputs of the test cases',
      required: true
    }
  },
  fn: async function(inputs, exits) {
    if (!fs.existsSync(sails.config.custom.dataPath + '/' + inputs.user_id + '/syntax')) {
      return exits.error('Directory does not exist.');
    }
    var path = sails.config.custom.dataPath + '/' + inputs.user_id + '/syntax';
    var max = 0;
    fs.readdirSync(path).forEach(file => {
      var current = parseInt(file);
      if (current > max) {
        max = current;
      }
    });
    var index = max + 1;
    var id = max + 10001;

    var information = inputs.exercise_text + '\n';
    for (var i = 0; i < inputs.argument_types.length; i++) {
      information += inputs.argument_types[i]
      if (i != inputs.argument_types.length - 1) {
        information += ",";
      }
    }
    information += "\n";
    for (var i = 0; i < inputs.argument_names.length; i++) {
      information += inputs.argument_names[i]
      if (i != inputs.argument_names.length - 1) {
        information += ",";
      }
    }
    information += "\n";
    for (var i = 0; i < inputs.test_case_inputs.length; i++) {
      information += inputs.test_case_inputs[i] + "#" + inputs.test_case_outputs[i] + "\n";
    }

    fs.writeFileSync(path + "/" + index + '.txt', information,'utf-8');
    return exits.success(id);
  }
}
