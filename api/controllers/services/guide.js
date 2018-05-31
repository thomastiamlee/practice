const fs = require('fs');

module.exports = {
	friendlyName: 'Get guide',
	description: 'Get guide for an exercise',
	inputs: {
    problem_id: {
			description: 'the ID of the problem the code is being submitted for',
			type: 'number',
      required: true
		},
    user_id: {
      description: 'the ID of the user who submitted the code',
      type: 'number',
      required: true
    }
	},
	exits: {
		success: {
			description: 'Hint was successfully retrieved'
		},
    error: {
      description: 'There was an error in retrieving the hint'
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
		if (inputs.user_id != this.req.session.user_id) {
			exits.success({type: 'unauthenticated', message: 'You are not logged in'});
			return;
		}
    if (inputs.problem_id > 10000) {
      var problem = await sails.helpers.getSyntaxExercise.with({user_id: this.req.session.user_id, problem_id: problemId});
      var flowchart = problem.flowchart;
      for (var i = 0; i < problem.hints.length; i++) {
        if (problem.hints[i].trim() == '') continue;
        problem.hints[i] = await sails.helpers.preprocessExerciseText.with({exercise_text: problem.hints[i]});
      }
      var hints = problem.hints;

      exits.success({flowchart: flowchart, hints: hints});
      return;
    }

    exits.success({flowchart: 'todo', hints: []});
		return;
	}
}
