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
    if (!this.req.session.user_id) {
      exits.unauthenticated('region');
      return;
    }
    var languagePack = await sails.helpers.loadLanguagePack.with({language: this.req.session.region});

    if (!inputs.id) {
      exits.invalidID();
      return;
    }
    var problem = await Problem.findOne({problem_id: inputs.id});
    if (!problem) {
      exits.invalidID();
      return;
    }

    // For Processing
    problem.return_type = await sails.helpers.preprocessExerciseText.with({exercise_text: problem.return_type});
    // For Processing
    for (var i = 0; i < problem.argument_types.length; i++) {
      problem.argument_types[i] = await sails.helpers.preprocessExerciseText.with({exercise_text: problem.argument_types[i]});
    }
    problem.task = await sails.helpers.preprocessExerciseText.with({exercise_text: problem.task});
    for (var i = 0; i < problem.assumptions.length; i++) {
      problem.assumptions[i] = await sails.helpers.preprocessExerciseText.with({exercise_text: problem.assumptions[i]});
    }

    problem.flowchart = replaceall('#', '\n', problem.flowchart);

    var sessionId = await sails.helpers.initializeSession.with({user_id: this.req.session.user_id});
    var timeNow = Date.now();
    exits.success({user_id: this.req.session.user_id, email: this.req.session.email, group: this.req.session.group, languagePack: languagePack, problem: problem, session_id: sessionId, exercise_mode: 'logic', server_timestamp: timeNow});
  }
}
