module.exports = {
	friendlyName: 'Display syntax practice instructions',
	description: 'Display the instructions for syntax practice.',
	exits: {
		instructions: {
			description: 'Can view instructions',
			responseType: 'view',
			viewTemplatePath: 'pages/instructions'
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
		var account = await Account.findOne({user_id: this.req.session.user_id});
		if (!account) {
			exits.unauthenticated('region');
			return;
		}
		var syntax_solved = account.syntax_solved;

    return exits.instructions({user_id: this.req.session.user_id, email: this.req.session.email, syntax_solved: syntax_solved, languagePack: languagePack});
	}
}
