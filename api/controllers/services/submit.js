const compile_run = require('compile-run');

module.exports = {
	friendlyName: 'Check submitted code',
	description: 'Check the code submitted for a problem',
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
    }
	},
	exits: {
		success: {
			description: 'Code was successfully checked'
		},
    error: {
      description: 'There was an error in checking the code'
    }
	},
	fn: async function(inputs, exits) {
		async function triggerPass(userId, problemId) {
			if (problemId > 10000) {
				var account = await Account.findOne({user_id: userId});
				await Account.update({user_id: userId}).set({syntax_solved: account.syntax_solved + 1});
				await Account.update({user_id: userId}).set({current_syntax_problem: -1});
			}
			else {
				var solved = await Solve.findOne({user_id: userId, problem_id: problemId});
				if (!solved) {
					await Solve.create({user_id: userId, problem_id: problemId});
				}
			}
		}

		if (!this.req.session.user_id) {
			exits.error({type: 'unauthenticated', message: 'You are not logged in.'});
			return;
		}
		if (inputs.problem_id > 10000) {
			var problemInformation = await sails.helpers.getSyntaxExercise.with({user_id: inputs.user_id, problem_id: inputs.problem_id});
			var testCaseInputs = problemInformation.test_case_inputs;
			var testCaseOutputs = problemInformation.test_case_outputs;
			for (var i = 0; i < testCaseInputs.length; i++) {
				testCaseInputs[i] = testCaseInputs[i].split(',');
			}
			var returnType = "int";
		}
		else {
			var problem = await Problem.findOne({problem_id: inputs.problem_id});
			if (!problem) {
				exits.error({type: 'invalid', message: 'Invalid problem ID.'});
				return;
			}
			var testCaseInputs = problem.test_case_inputs;
			var testCaseOutputs = problem.test_case_outputs;
			for (var i = 0; i < testCaseInputs.length; i++) {
				testCaseInputs[i] = testCaseInputs[i].split(/\,\s?(?![^{]*})/);
			}
			var returnType = problem.return_type;
		}
		var wrapped = await sails.helpers.wrapCode.with({code: inputs.code, user_id: inputs.user_id, problem_id: inputs.problem_id, test_cases: testCaseInputs, return_type: returnType});

		var completed = false;
		compile_run.runJava(wrapped.code, '', function(stdout, stderr, err) {
			if (!err) {
				sails.log.info(stdout);
				sails.log.info(stderr);
				if (stderr) {
					exits.success({type: 'failed'});
					completed = true;
				}
				else if (stdout == '') {
					exits.success({type: 'failed'});
					completed = true;
				}
				else {
					stdout = stdout.trim().split('\n');

					if (stdout.length != testCaseOutputs.length) {
						exits.success({type: 'failed'});
						completed = true;
					}
					var correct = true;
					for (var i = 0; i < testCaseOutputs.length; i++) {
						sails.log.info(stdout[i] + '   and    ' + testCaseOutputs[i]);
						if (stdout[i] != testCaseOutputs[i]) {
							correct = false;
							break;
						}
					}
					if (!correct) {
						exits.success({type: 'failed'});
						completed = true;
					}
					else {
						triggerPass(inputs.user_id, inputs.problem_id);
						exits.success({type: 'passed'});
						completed = true;
					}
				}
			}
			else {
				exits.success({type: 'failed'});
			}
		});

		setTimeout(function () {
			if (!completed) {
				return exits.error({type: 'failed', message: 'Failed to run the code.'});
			}
			else {
				return;
			}
		}, 10000);
	}
}
