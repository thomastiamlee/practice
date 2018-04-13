module.exports = {
  friendlyName: 'Logout account',
  description: 'Logout the currently active account, if any',
  exits: {
    success: {
      description: 'Session was ended',
      responseType: 'redirect'
    }
  },
  fn: function(inputs, exits) {
    delete this.req.session.user_id;
    delete this.req.session.email;
    exits.success('/login');
  }
}
