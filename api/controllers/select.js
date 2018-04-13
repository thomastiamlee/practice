const ITEMS_PER_PAGE = 10;

module.exports = {
  friendlyName: 'Select a problem',
  description: 'Allow the user to select a problem to solve',
  inputs: {
    p: {
      description: 'The page number',
      type: 'number'
    }
  },
  exits: {
    success: {
      description: 'User can select the problem to solve',
      responseType: 'view',
      viewTemplatePath: 'pages/select'
    },
    invalidPage: {
      description: 'The page is out of range',
      responseType: 'notFound'
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
    if (!inputs.p) {
      inputs.p = 0;
    }
    var problems = await Problem.find({select: ['problem_id', 'title']}).sort([{ problem_id: 'ASC' }]).limit(10).skip(inputs.p * ITEMS_PER_PAGE);
    var count = await Problem.count();
    if (problems.length == 0) {
      exits.invalidPage();
    }
    var solved = await Solve.find({select: ['problem_id'], where: {user_id: this.req.session.user_id}});
    solved = solved.map(x => x.problem_id);
    exits.success({user_id: this.req.session.user_id, email: this.req.session.email, problems: problems, solved: solved, count: count, page: inputs.p });
  }
}
