const ITEMS_PER_PAGE = 10;

module.exports = {
  friendlyName: 'Select a problem',
  description: 'Allow the user to select a problem to solve',
  inputs: {
    p: {
      description: 'The page number',
      type: 'number'
    },
    f: {
      description: 'The filter (u - unsolved, s - solved, a - all)',
      type: 'string'
    },
    m: {
      description: 'The mode (l - logic, r - review)',
      type: 'string'
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
    if (account && account.agreement == 'no') {
      exits.agreement('agreement');
      return;
    }
    var languagePack = await sails.helpers.loadLanguagePack.with({language: this.req.session.region});

    if (!inputs.p) {
      inputs.p = 0;
    }
    if (!inputs.f) {
      inputs.f = 'a';
    }
    if (!inputs.m) {
      inputs.m = 'l';
    }
    if (inputs.m != 'l' && inputs.m != 'r') {
      inputs.m = 'l';
    }
    var solved = await Solve.find({select: ['problem_id'], where: {user_id: this.req.session.user_id}});
    solved = solved.map(x => x.problem_id);
    if (inputs.m == 'l') {
      var minProblemId = 1;
      var maxProblemId = 1000;
    }
    else {
      var minProblemId = 1001;
      var maxProblemId = 2000;
    }

    if (inputs.f == 's') {
      var filter = 's';
      var problems = await Problem.find({select: ['problem_id', 'title', 'title_jp'], where: {problem_id: {'in': solved, '>=': minProblemId, '<=': maxProblemId}}}).sort([{ problem_id: 'ASC' }]).limit(10).skip(inputs.p * ITEMS_PER_PAGE);
      var count = await Problem.count({where: {problem_id: solved}});
    }
    else if (inputs.f == 'u') {
      var filter = 'u';
      var problems = await Problem.find({select: ['problem_id', 'title', 'title_jp'], where: {problem_id: {'nin': solved, '>=': minProblemId, '<=': maxProblemId}}}).sort([{ problem_id: 'ASC' }]).limit(10).skip(inputs.p * ITEMS_PER_PAGE);
      var count = await Problem.count({where: {problem_id: {'!=': solved}}});
    }
    else {
      var filter = 'a';
      var problems = await Problem.find({select: ['problem_id', 'title', 'title_jp'], where: {problem_id: {'>=': minProblemId, '<=': maxProblemId}}}).sort([{ problem_id: 'ASC' }]).limit(10).skip(inputs.p * ITEMS_PER_PAGE);
      var count = await Problem.count();
    }

    exits.success({user_id: this.req.session.user_id, email: this.req.session.email, region: this.req.session.region, languagePack: languagePack, problems: problems, solved: solved, count: count, page: inputs.p, filter: filter, mode: inputs.m });
  }
}
