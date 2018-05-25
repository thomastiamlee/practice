const generator = require('../app_modules/naive/generator.js');
const textGenerator = require('../app_modules/naive/text-generator.js');
const testCaseGenerator = require('../app_modules/naive/test-case-generator.js');
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
      var exerciseText = textGenerator.convertExerciseToNativeText('en', exercise.head, exercise.symbols);
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
    var problemId = await sails.helpers.writeSyntaxExercise.with({user_id: inputs.user_id, exercise_text: exerciseText, argument_types: argumentTypes, argument_names: argumentNames, test_case_inputs: testCaseInputs, test_case_outputs: testCaseOutputs});
    var problem = {
      problem_id: problemId,
      return_type: 'int',
  		method_name: 'theFunction',
  		argument_types: argumentTypes,
  		argument_names: argumentNames,
  		task: exerciseText,
  		assumptions: ["You can ignore cases where numbers are divided by 0."],
  		test_case_inputs: testCaseInputs,
  		test_case_outputs: testCaseOutputs
    }

    return exits.success(problem);
  }
}
