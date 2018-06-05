module.exports = {
	friendlyName: 'Accept User Agreement',
	description: 'Accept informed consent details',
  exits: {
    unauthenticated: {
      description: 'There is no session or session has expired',
      responseType: 'redirect'
    },
    success: {
      description: 'Agreement was accepted',
      responseType: 'redirect'
    }
  },
	fn: async function(inputs, exits) {
    if (!this.req.session.user_id) {
      exits.unauthenticated('region');
      return;
    }
    await Account.update({user_id: this.req.session.user_id}).set({agreement: 'yes'});

    exits.success('mode');
	}
}
