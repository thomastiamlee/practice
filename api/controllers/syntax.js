const generator = require('../app_modules/naive/generator.js');
const textGenerator = require('../app_modules/naive/text-generator.js');
const testCaseGenerator = require('../app_modules/naive/test-case-generator.js');

module.exports = {
  friendlyName: 'Start syntax practice',
  description: 'Provides an interface for the user to do syntax practice',
  exits: {
    success: {
      description: 'User can do syntax practice',
      responseType: 'view',
      viewTemplatePath: 'pages/problem'
    },
    unauthenticated: {
      description: 'There is no session or session has expired',
      responseType: 'redirect'
    }
  },
  fn: async function(inputs, exits) {
    if (!this.req.session.user_id) {
      exits.unauthenticated('login');
      return;
    }
    var sessionId = await sails.helpers.initializeSession.with({user_id: this.req.session.user_id});

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
      var exercise = generator.generateBasicExercise({complexity: 3});
      var exerciseText = textGenerator.convertExerciseToNativeText('en', exercise.head, exercise.symbols);
      testCases = testCaseGenerator.generateTestCases(exercise, 100);
    }

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

    var problemId = await sails.helpers.writeSyntaxExercise.with({user_id: this.req.session.user_id, exercise_text: exerciseText, argument_types: argumentTypes, argument_names: argumentNames, test_case_inputs: testCaseInputs, test_case_outputs: testCaseOutputs});
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

    exits.success({user_id: this.req.session.user_id, email: this.req.session.email, problem: problem, session_id: sessionId, exercise_mode: 'syntax'});
  }
}
