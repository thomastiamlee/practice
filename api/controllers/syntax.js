

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

    var problem = await sails.helpers.generateSyntaxExercise.with({complexity: 3, user_id: this.req.session.user_id})

    exits.success({user_id: this.req.session.user_id, email: this.req.session.email, problem: problem, session_id: sessionId, exercise_mode: 'syntax'});
  }
}
