module.exports = {
	attributes: {
    problem_id: { type: 'number', required: true },
		title: { type: 'string', required: true },
		return_type: { type: 'string' },
		method_name: { type: 'string' },
		argument_types: { type: 'string', columnType: 'array' },
		argument_names: { type: 'string', columnType: 'array' },
		task: { type: 'string' },
		assumptions: { type: 'string', columnType: 'array' },
		test_case_inputs: { type: 'string', columnType: 'array' },
		test_case_outputs: { type: 'string', columnType: 'array' }
	}
}
