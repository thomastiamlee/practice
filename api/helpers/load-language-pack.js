const language = require('../app_modules/lang/language_pack.js');

module.exports = {
  friendlyName: 'Get the language pack information',
  description: 'This extracts the appropriate language pack for the system.',
  inputs: {
    language: {
      type: 'string',
      description: 'either \'en\' or \'jp\', represents the language to be extracted',
      required: true
    }
  },
  fn: async function(inputs, exits) {
    var data = language.data;
    var res = {};
    for (var text in data) {
      if (!data.hasOwnProperty(text)) continue;
      if (data[text][inputs.language]) {
        res[text]  = data[text][inputs.language];
      }
      else {
        res[text] = '-';
      }
    }
    return exits.success(res);
  }
}
