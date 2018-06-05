const fs = require('fs');
const Peg = require("pegjs");
const templateGrammarPath = "./api/app_modules/naive/grammar/template-grammar.txt";
const nativeHintTemplatesPathJP = "./api/app_modules/naive/templates/hint-jp.txt";
const nativeHintTemplatesPathEN = "./api/app_modules/naive/templates/hint.txt";

const nodes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'];

function loadNativeHintTemplates() {
	var data = fs.readFileSync(nativeHintTemplatesPath, "utf-8");
	var grammar = fs.readFileSync(templateGrammarPath, "utf-8");
	var parser = Peg.generate(grammar, {trace: false});
	var result = parser.parse(data);
	return result;
}

function getRandomTemplateText(templates, key) {
	for (var i = 0; i < templates.length; i++) {
		if (templates[i].heading == key) {
			var candidates = templates[i].templates;
			return candidates[Math.floor(Math.random() * candidates.length)];
		}
	}
	return null;
}

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
		else {
			var problem = await Problem.findOne({problem_id: inputs.problem_id});
			if (this.req.session.region == 'en') {
				nativeHintTemplatesPath = nativeHintTemplatesPathEN;
			}
			else if (this.req.session.region == 'jp') {
				nativeHintTemplatesPath = nativeHintTemplatesPathJP;
			}
			var templates = loadNativeHintTemplates();
			var guideKeys = problem.guide_key;
			var res = [];
			for (var i = 0; i < guideKeys.length; i++) {
				res.push(await sails.helpers.preprocessExerciseText.with({exercise_text: nodes[i] + '#' + getRandomTemplateText(templates, guideKeys[i])}));
			}
			exits.success({flowchart: problem.flowchart, hints: res});
			return;
		}

    exits.success({flowchart: 'todo', hints: []});
		return;
	}
}
