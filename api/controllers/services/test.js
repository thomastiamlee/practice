var compile_run = require('compile-run');
const EXECUTING_TIME_LIMIT = 10000;

module.exports = {
	friendlyName: 'Test submitted code',
	description: 'Test the code submitted for a problem',
	inputs: {
		code: {
			description: 'the code submitted by the user',
			type: 'string'
		},
		problem_id: {
			description: 'the ID of the problem the code is being submitted for',
			type: 'number'
		},
    user_id: {
      description: 'the ID of the user who submitted the code',
      type: 'number'
    },
    test_case: {
      description: 'the test case provided for testing',
      type: ['string']
    }
	},
	exits: {
		success: {
			description: 'Code was successfully executed'
		},
    error: {
      description: 'There was an error in checking the code'
    }
	},
	fn: async function(inputs, exits) {
		if (!this.req.session.user_id) {
			exits.error({type: 'unauthenticated', message: 'You are not logged in.'});
			return;
		}
		if (inputs.problem_id >= 10000) {
			var returnType = "int";
		}
		else {
			var problem = await Problem.findOne({problem_id: inputs.problem_id});
			if (!problem) {
				exits.error({type: 'invalid', message: 'Invalid problem ID.'});
				return;
			}
			var returnType = problem.return_type;
		}
    var wrapped = await sails.helpers.wrapCode.with({code: inputs.code, problem_id: inputs.problem_id, user_id: inputs.user_id, test_cases: [inputs.test_case], return_type: returnType});
		var code = wrapped.code;
		var offset = wrapped.offset;


		return compile_run.runJava(code, ['-J-Duser.language=en'], function(stdout, stderr, err) {
      if (!err) {
        if (stderr) {
					var target = stderr.indexOf('Main.java:') + 10;
					var lineNumber = '';
					while (stderr.charAt(target) != ':') {
						lineNumber += stderr.charAt(target);
						target++;
					}
					lineNumber = parseInt(lineNumber);
					if (stderr.indexOf('Exception') != -1) {
						var error = stderr.split('\n')[0];
					}
					else {
						var error = stderr.substring(target + 2).split('\n').slice(0,3).join('\n');
					}
          exits.success({type: 'error', message: error, offset: offset, lineNumber: lineNumber});
        }
        else if (stdout == '') {
          exits.success({type: 'no_output', message: stdout, offset: offset});
        }
        else {
          exits.success({type: 'no_error', message: stdout, offset: offset});
        }
      }
      else {
        exits.error({type: 'failed', message: err});
      }
    });
	}
}
