var replaceall = require('replaceall');
const fs = require('fs');

module.exports = {
  friendlyName: 'Preprocess exercise text.',
  description: 'This is used to prepare exercise text for rendering in HTML.',
  inputs: {
    exercise_text: {
      type: 'string',
      description: 'The text of the generated exercise',
      required: true
    },
  },
  fn: async function(inputs, exits) {
    var result = inputs.exercise_text;
    // Reaplce all double with float
    result = replaceall('double', 'float', result);
    // Replace all [LB] with a line break
    result = replaceall('[LB]', '<br />', result);
    // Replace all ` `` pairs with <span class='code-text'></span>
    result = replaceall('``', '</span>', result);
    result = replaceall('`', '<span class=\'code-text\'>', result);
    return exits.success(result);
  }
}
