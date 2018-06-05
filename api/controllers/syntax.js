

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
    },
    agreement: {
      description: 'User has not agreed on terms',
      responseType: 'redirect'
    }
  },
  fn: async function(inputs, exits) {
    if (!this.req.session.user_id) {
      exits.unauthenticated('region');
      return;
    }
    var account = await Account.findOne({user_id: this.req.session.user_id});
    if (account.agreement == 'no') {
      exits.agreement('agreement');
      return;
    }
    var languagePack = await sails.helpers.loadLanguagePack.with({language: this.req.session.region});

    var account = await Account.findOne({user_id: this.req.session.user_id});
    if (account.current_syntax_problem == -1) {
      exits.generate('generate');
      return;
    }
    else {
      problemId = account.current_syntax_problem;
    }

    var problem = await sails.helpers.getSyntaxExercise.with({user_id: this.req.session.user_id, problem_id: problemId});

    if (!problem) {
      exits.generate('generate');
      return;
    }

    var sessionId = await sails.helpers.initializeSession.with({user_id: this.req.session.user_id});
    var timeNow = Date.now();
    exits.success({user_id: this.req.session.user_id, email: this.req.session.email, group: this.req.session.group, syntax_solved: account.syntax_solved, languagePack: languagePack, problem: problem, session_id: sessionId, exercise_mode: 'syntax', server_timestamp: timeNow});
  }
}
