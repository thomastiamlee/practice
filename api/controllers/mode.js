module.exports = {
  friendlyName: 'Select a mode',
  description: 'Allow the user to select a mode',
  exits: {
    success: {
      description: 'User can select the mode',
      responseType: 'view',
      viewTemplatePath: 'pages/mode'
    },
    unauthenticated: {
      description: 'There is no session or session has expired',
      responseType: 'redirect'
    }
  },
  fn: async function(inputs, exits) {
    var languagePack = await sails.helpers.loadLanguagePack.with({language: 'jp'});
		if (!this.req.session.user_id) {
      exits.unauthenticated('login');
      return;
    }
    exits.success({user_id: this.req.session.user_id, email: this.req.session.email, languagePack: languagePack});
  }
}
