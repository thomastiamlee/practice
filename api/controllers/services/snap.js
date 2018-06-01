const fs = require('fs');
const jsonformatter = require('format-json');

module.exports = {
	friendlyName: 'Log snap',
	description: 'Accept a face information from the client and save it.',
	inputs: {
		face_data: {
			description: 'The log, in JSON array format',
			type: 'string',
      required: true
		},
		session_id: {
			description: 'The ID assigned to this session (this is different from the session ID of the account)',
			type: 'string',
			required: true
		},
		user_id: {
			type: 'string',
      description: 'The user ID',
      required: true
		},
    timestamp: {
      type: 'string',
      description: 'The server timestamp when this snap was taken',
      required: true
    }
	},
	exits: {
		success: {
			description: 'Data was successfully logged'
		},
    error: {
      description: 'There was an error in logging the history'
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

    function decodeBase64Image(dataString) {
      var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

      if (matches.length !== 3) {
        return new Error('Invalid input string');
      }

      response.type = matches[1];
      response.data = new Buffer(matches[2], 'base64');

      return response;
    }

		if (!fs.existsSync(sails.config.custom.dataPath + '/' + inputs.user_id + '/sessions/' + inputs.session_id)) {
			exits.error({type: 'invalid', message: 'Invalid session ID'});
		}
		var target = sails.config.custom.dataPath + '/' + inputs.user_id + '/sessions/' + inputs.session_id + '/snap/' + inputs.timestamp + '.jpg';
    var imageBuffer = decodeBase64Image(inputs.face_data);

    fs.writeFileSync(target, imageBuffer.data);

		exits.success({type: 'success', message: 'Face data logged.'});
		return;
	}
}
