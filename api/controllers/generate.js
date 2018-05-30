module.exports = {
  friendlyName: 'Generate syntax practice',
  description: 'Generates a new syntax practice for the user',
  exits: {
    success: {
      description: 'Exercise has been generated',
      responseType: 'redirect',
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

    problemId = await sails.helpers.generateSyntaxExercise.with({language: this.req.session.region, complexity: 1, user_id: this.req.session.user_id})
    await Account.update({user_id: this.req.session.user_id}).set({current_syntax_problem: problemId})

    exits.success('syntax');
  }
}
