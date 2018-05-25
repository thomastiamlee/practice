module.exports = {
	attributes: {
    problem_id: { type: 'string', required: true },
		title: { type: 'string', required: true },
		return_type: { type: 'string' },
		method_name: { type: 'string' },
		argument_types: { type: 'json', columnType: 'array' },
		argument_names: { type: 'json', columnType: 'array' },
		task: { type: 'string' },
		assumptions: { type: 'json', columnType: 'array' },
		test_case_inputs: { type: 'json', columnType: 'array' },
		test_case_outputs: { type: 'json', columnType: 'array' }
	}
}
