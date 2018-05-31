const generator = require('../app_modules/naive/generator.js');
const textGenerator = require('../app_modules/naive/text-generator.js');
const testCaseGenerator = require('../app_modules/naive/test-case-generator.js');
const reader = require('../app_modules/reader.js');
const fs = require('fs');

module.exports = {
  friendlyName: 'Generate syntax exercise',
  description: 'This calls the coding exercise generator to generate an abstract exercise.',
  inputs: {
    complexity: {
      type: 'number',
      description: 'The complexity of the exercise to be generated',
      required: true
    },
    language: {
      type: 'string',
      description: 'The desired language of the exercise (either jp or en)',
      required: true
    },
    user_id: {
      type: 'string',
      description: 'The user ID',
      required: true
    }
  },
  fn: async function(inputs, exits) {
    function getName(object, list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].obj == object) {
          return list[i].name;
        }
      }
      return null;
    }
    var testCases = [];
    while (testCases.length < 50) {
      var exercise = generator.generateBasicExercise({complexity: inputs.complexity});
      var exerciseText = textGenerator.convertExerciseToNativeText(inputs.language, exercise.head, exercise.symbols);
      testCases = testCaseGenerator.generateTestCases(exercise, 100);
    }
    exerciseText = await sails.helpers.preprocessExerciseText.with({exercise_text: exerciseText});
    var testCaseInputs = [];
    var testCaseOutputs = [];
    for (var i = 0; i < testCases.length; i++) {
      var inputString = "";
      for (var j = 0; j < testCases[i].parameters.length; j++) {
        inputString += testCases[i].parameters[j];
        if (j != testCases[i].parameters.length - 1) {
          inputString += ",";
        }
      }
      testCaseInputs.push(inputString);
      testCaseOutputs.push(testCases[i].returnValue);
    }
    var argumentTypes = [];
    var argumentNames = [];
    for (var i = 0; i < exercise.inputVariables.length; i++) {
      argumentTypes.push('int');
      argumentNames.push(getName(exercise.inputVariables[i], exercise.symbols));
    }
    var flowchart = reader.convertToFlowchartDefinition(exercise);

    var problem = {
      return_type: 'int',
  		method_name: 'theFunction',
  		argument_types: argumentTypes,
  		argument_names: argumentNames,
  		task: exerciseText,
  		assumptions: ["You can ignore cases where numbers are divided by 0."],
  		test_case_inputs: testCaseInputs,
  		test_case_outputs: testCaseOutputs,
      flowchart: flowchart.flowchart,
      hints: flowchart.hints
    }

    /* Write the syntax exercise to the file. */
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

    var information = exerciseText + '\n';
    for (var i = 0; i < argumentTypes.length; i++) {
      information += argumentTypes[i]
      if (i != argumentTypes.length - 1) {
        information += ",";
      }
    }
    information += "\n";
    for (var i = 0; i < argumentNames.length; i++) {
      information += argumentNames[i]
      if (i != argumentNames.length - 1) {
        information += ",";
      }
    }
    information += "\n";
    for (var i = 0; i < testCaseInputs.length; i++) {
      information += testCaseInputs[i] + "#" + testCaseOutputs[i] + "\n";
    }
    information += 'FLOWCHART\n';
    information += flowchart.flowchart;
    information += 'HINTS\n';
    for (var i = 0; i < flowchart.hints.length; i++) {
      information += flowchart.hints[i] + '\n';
    }

    fs.writeFileSync(path + "/" + index + '.txt', information,'utf-8');

    return exits.success(id);
  }
}
