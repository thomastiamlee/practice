module.exports = {
	friendlyName: 'Login account',
	description: 'Lookup the specified account and log it in, or go back to the login page if no or incorrect credentials were found',
	inputs: {
		email: {
			description: 'the email of the user',
			type: 'string'
		},
		password: {
			description: 'the password of the user',
			type: 'string'
		}
	},
	exits: {
		login: {
			description: 'Login failed',
			responseType: 'view',
			viewTemplatePath: 'pages/login'
		},
		success: {
			description: 'Login was successful',
			responseType: 'redirect'
		},
		notFound: {
			description: 'Invalid region',
			responseType: 'notFound'
		}
	},
	fn: async function(inputs, exits) {
		var region = this.req.param('region');
		if (region != 'en' && region != 'jp') {
			exits.notFound();
			return;
		}
		var languagePack = await sails.helpers.loadLanguagePack.with({language: region});
		if (this.req.session.user_id) {
			exits.success(sails.config.custom.baseUrl + 'mode');
			return;
		}
		if (this.req.method == 'GET') {
			exits.login({languagePack: languagePack, region: region});
			return;
		}
		var account = await Account.findOne({email: inputs.email, password: inputs.password});
		if (!account || account.region != region) {
			exits.login({error: 'failed', languagePack: languagePack, region: region});
			return;
		}
		else {
			this.req.session.user_id = account.user_id;
			this.req.session.email = account.email;
			this.req.session.region = account.region;
			exits.success(sails.config.custom.baseUrl + 'mode');
			return;
		}
	}
}
