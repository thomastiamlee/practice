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
		region: {
			description: 'Can choose region',
			responseType: 'view',
			viewTemplatePath: 'pages/region'
		}
	},
	fn: async function(inputs, exits) {
		if (this.req.session.user_id) {
			exits.success('mode');
			return;
		}

    return exits.region();
	}
}
