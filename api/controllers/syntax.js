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
    /*if (!this.req.session.user_id) {
      exits.unauthenticated('login');
      return;
    }*/

    var exercise = generator.generateBasicExercise({complexity: 3});
    var exerciseText = textGenerator.convertExerciseToNativeText('en', exercise.head, exercise.symbols);
    console.log(exerciseText);

    var sessionId = await sails.helpers.initializeSession.with({user_id: this.req.session.user_id});
    exits.success({user_id: this.req.session.user_id, email: this.req.session.email, problem: problem, session_id: sessionId});
  }
}
