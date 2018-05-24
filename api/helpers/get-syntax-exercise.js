const fs = require('fs');

module.exports = {
  friendlyName: 'Gets information of generated syntax exercise',
  description: 'Gets the information from a saved generated syntax exercise.',
  inputs: {
    user_id: {
      type: 'number',
      description: 'The user ID',
      required: true
    },
    problem_id: {
      type: 'string',
      description: 'The ID of generated syntax exercise (use the real ID, e.g., 10001)',
      required: true
    }
  },
  fn: async function(inputs, exits) {
    var realId = inputs.problem_id - 10000;
    var path = sails.config.custom.dataPath + '/' + inputs.user_id + '/syntax/' + realId + '.txt';
    if (!fs.existsSync(path)) {
      return exits.error('Exercise does not exist.');
    }

    var data = fs.readFileSync(path, 'utf-8').split('\n');
    var exercise_text = data[0];
    var argument_types = data[1].split(',');
    var argument_names = data[2].split(',');
    var test_case_inputs = [];
    var test_case_outputs = [];
    for (var i = 3; i < data.length; i++) {
      if (data[i].trim() == "") continue;
      var line = data[i].split('#');
      test_case_inputs.push(line[0]);
      test_case_outputs.push(line[1]);
    }
    var problemInformation = {
      exercise_text: exercise_text,
      argument_types: argument_types,
      argument_names: argument_names,
      test_case_inputs: test_case_inputs,
      test_case_outputs: test_case_outputs
    };

    return exits.success(problemInformation);
  }
}
