module.exports = {
	friendlyName: 'View User Agreement',
	description: 'Show informed consent details and allow the user to accept it',
	exits: {
		agreement: {
			description: 'Agreement not yet accepted',
			responseType: 'view',
			viewTemplatePath: 'pages/agreement'
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
    exits.agreement({languagePack: languagePack, group: this.req.session.group});
	}
}
