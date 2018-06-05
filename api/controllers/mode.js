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
    },
    agreement: {
      description: 'User has not agreed on terms',
      responseType: 'redirect'
    }
  },
  fn: async function(inputs, exits) {
    if (!this.req.session.user_id) {
      exits.unauthenticated('region');
      return;
    }
    var account = await Account.findOne({user_id: this.req.session.user_id});
    if (account.agreement == 'no') {
      exits.agreement('agreement');
      return;
    }
    var languagePack = await sails.helpers.loadLanguagePack.with({language: this.req.session.region});

    exits.success({user_id: this.req.session.user_id, email: this.req.session.email, languagePack: languagePack});
  }
}
