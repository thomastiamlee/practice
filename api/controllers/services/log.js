const fs = require('fs');

module.exports = {
	friendlyName: 'Log data',
	description: 'Log data from the client',
	inputs: {
		log_data: {
			description: 'The log, in JSON array format',
			type: ['ref']
		},
		session_id: {
			description: 'The ID assigned to this session (this is different from the session ID of the account)',
			type: 'string'
		}
	},
	exits: {
		success: {
			description: 'History was successfully logged'
		},
    error: {
      description: 'There was an error in logging the history'
    }
	},
	fn: async function(inputs, exits) {
		if (!this.req.session.user_id) {
			exits.error({type: 'unauthenticated', message: 'You are not logged in.'});
			return;
		}
		if (!inputs.log_data) {
			exits.success({type: 'success', message: 'Log data is empty.'});
			return;
		}
		var target = sails.config.custom.dataPath + '/' + this.req.session.user_id + '/' + inputs.session_id + '.txt';
		if (!fs.existsSync(target)) {
			exits.error({type: 'invalid', message: 'Invalid session ID'});
			return;
		}
		var history = JSON.parse(fs.readFileSync(target, 'utf-8'));
		history = history.concat(inputs.log_data);
		fs.writeFileSync(target, JSON.stringify(history), 'utf-8');
		exits.success({type: 'success', message: 'Log data appended.'});
		return;
	}
}
