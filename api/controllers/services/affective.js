const fs = require('fs');
const jsonformatter = require('format-json');

module.exports = {
	friendlyName: 'Request for affect detection',
	description: 'Checks, based on previous logs, if the user is confused',
	inputs: {
    user_id: {
      type: 'string',
      description: 'The user ID',
      required: true
    },
    session_id: {
      type: 'string',
      description: 'The ID assigned to this session (this is different from the session ID of the account)',
      required: true
    }
	},
	exits: {
		success: {
			description: 'Affect was successfully detected'
		},
    error: {
      description: 'There was an error in detecting affect'
    },
		unauthenticated: {
			description: 'User is unauthenticated'
		}
	},
	fn: async function(inputs, exits) {
		if (!this.req.session.user_id) {
			exits.unauthenticated({type: 'unauthenticated', message: 'You are not logged in.'});
			return;
		}
		if (this.req.session.user_id != inputs.user_id) {
			exits.unauthenticated({type: 'unauthenticated', message: 'You are not logged in.'});
			return;
		}

    var confused = await sails.helpers.detectConfusion.with({user_id: inputs.user_id, session_id: inputs.session_id});

		exits.success({type: 'success', confused: confused});
		return;
	}
}
