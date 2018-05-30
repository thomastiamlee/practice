

module.exports = {
  friendlyName: 'Start syntax practice',
  description: 'Provides an interface for the user to do syntax practice',
  exits: {
    success: {
      description: 'User can do syntax practice',
      responseType: 'view',
      viewTemplatePath: 'pages/problem'
    },
    generate: {
      description: 'Exercise must be generated',
      responseType: 'redirect'
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
    var sessionId = await sails.helpers.initializeSession.with({user_id: this.req.session.user_id});

    var account = await Account.findOne({user_id: this.req.session.user_id});
    if (account.current_syntax_problem == -1) {
      exits.generate('generate');
      return;
    }
    else {
      problemId = account.current_syntax_problem;
    }

    var problem = await sails.helpers.getSyntaxExercise.with({user_id: this.req.session.user_id, problem_id: problemId});

    exits.success({user_id: this.req.session.user_id, email: this.req.session.email, syntax_solved: account.syntax_solved, languagePack: languagePack, problem: problem, session_id: sessionId, exercise_mode: 'syntax'});
  }
}
