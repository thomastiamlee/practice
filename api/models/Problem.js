module.exports = {
	attributes: {
    problem_id: { type: 'number', required: true },
		title: { type: 'string', required: true },
		title_jp: { type: 'string', required: true },
		return_type: { type: 'string' },
		method_name: { type: 'string' },
		argument_types: { type: 'json', columnType: 'array' },
		argument_names: { type: 'json', columnType: 'array' },
		task: { type: 'string' },
		task_jp: { type: 'string' },
		assumptions: { type: 'json', columnType: 'array' },
		assumptions_jp: { type: 'json', columnType: 'array' },
		test_case_inputs: { type: 'json', columnType: 'array' },
		test_case_outputs: { type: 'json', columnType: 'array' },
		flowchart: { type: 'string' },
		flowchart_jp: { type: 'string' },
		guide_key: { type: 'json', columnType: 'array' }
	}
}
