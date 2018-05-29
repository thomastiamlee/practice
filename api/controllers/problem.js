const replaceall = require('replaceall');

module.exports = {
  friendlyName: 'Solve a problem',
  description: 'Provides an interface for the user to solve the problem',
  inputs: {
    id: {
      description: 'The problem ID',
      type: 'number'
    }
  },
  exits: {
    success: {
      description: 'User can solve the problem',
      responseType: 'view',
      viewTemplatePath: 'pages/problem'
    },
    invalidID: {
      description: 'The problem does not exist',
      responseType: 'notFound'
    },
    unauthenticated: {
      description: 'There is no session or session has expired',
      responseType: 'redirect'
    }
  },
  fn: async function(inputs, exits) {
    var languagePack = await sails.helpers.loadLanguagePack.with({language: this.req.session.region});
    if (!this.req.session.user_id) {
      exits.unauthenticated('region');
      return;
    }
    if (!inputs.id) {
      exits.invalidID();
      return;
    }
    var problem = await Problem.findOne({problem_id: inputs.id});
    if (!problem) {
      exits.invalidID();
      return;
    }
    problem.task = await sails.helpers.preprocessExerciseText.with({exercise_text: problem.task});
    for (var i = 0; i < problem.assumptions.length; i++) {
      problem.assumptions[i] = await sails.helpers.preprocessExerciseText.with({exercise_text: problem.assumptions[i]});
    }

    problem.flowchart = replaceall('#', '\n', problem.flowchart);

    var sessionId = await sails.helpers.initializeSession.with({user_id: this.req.session.user_id});
    exits.success({user_id: this.req.session.user_id, email: this.req.session.email, languagePack: languagePack, problem: problem, session_id: sessionId, exercise_mode: 'logic'});
  }
}
