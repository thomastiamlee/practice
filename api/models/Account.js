module.exports = {
	attributes: {
		email: { type: 'string', required: true },
		password: { type: 'string', required: true },
		user_id: { type: 'number', required: true },
		region: { type: 'string', required: true },
		group: {type: 'string', required: true },
		syntax_solved: { type: 'number', required: true },
		current_syntax_problem: { type: 'number', required: true },
		agreement: { type: 'string', required: true }
	}
}
