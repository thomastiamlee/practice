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
		}
	},
	fn: async function(inputs, exits) {
		if (this.req.session.user_id) {
			exits.success('select');
			return;
		}
		if (this.req.method == 'GET') {
			exits.login();
			return;
		}
		var account = await Account.findOne({email: inputs.email, password: inputs.password});
		if (!account) {
			exits.login({error: 'failed'});
			return;
		}
		else {
			this.req.session.user_id = account.user_id;
			this.req.session.email = account.email;
			exits.success('mode');
			return;
		}
	}
}
