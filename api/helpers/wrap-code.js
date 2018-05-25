const fs = require('fs');

const IMPORT_STATEMENT = 'import java.io.*;\n';
const CLASS_HEADER = 'public class Main {\n';
const CLOSE_BRACKET = '}\n';
const MAIN_METHOD_HEADER = 'public static void main(String[] args) {\n';
const OBJECT_INSTIATION = 'Main o = new Main();\n'
const PRINTSTREAM_INITIALIZATION = 'PrintStream _originalStream = System.out;\n' +
  'PrintStream _dummyStream = new PrintStream(new OutputStream() { public void write(int b) {} });\n' +
  'System.setOut(_dummyStream);\n';
const RESULT_STRING = 'String _result = "";\n';
const OUTPUT_STRING = 'System.setOut(_originalStream);\n' +
  'System.out.print(_result);';


module.exports = {
  friendlyName: 'Wrap code',
  description: 'Wrap the submitted code snippet to make the full Java class for compilation',
  inputs: {
    user_id: {
      type: 'string',
      description: 'The user ID',
      required: false
    },
    problem_id: {
      type: 'string',
      description: 'The problem ID',
      required: true
    },
    code: {
      type: 'string',
      description: 'The code submitted'
    },
    test_cases: {
      type: [['string']],
      description: 'The test cases as a comma separated value of literals',
      required: true
    }
  },
  fn: async function(inputs, exits) {
    if (inputs.problem_id > 10000) {
      var problemInformation = await sails.helpers.getSyntaxExercise.with({user_id: inputs.user_id, problem_id: inputs.problem_id});
      var problem = {
        return_type: 'int',
        method_name: 'theFunction',
        argument_names: problemInformation.argument_names,
        argument_types: problemInformation.argument_types
      }
    }
    else {
      var problem = await Problem.findOne({problem_id: inputs.problem_id});
    }
    if (!problem) {
      return exits.error('invalid problem ID');
    }
    var returnType = problem.return_type;
    var methodName = problem.method_name;
    var argumentNames = problem.argument_names;
    var argumentTypes = problem.argument_types;
    var testCases = inputs.test_cases;

    var res = IMPORT_STATEMENT;
    res += CLASS_HEADER;

    res += returnType + ' ' + methodName + '(';
    for (var i = 0; i < argumentNames.length; i++) {
      res += argumentTypes[i] + ' ' + argumentNames[i];
      if (i != argumentNames.length - 1) {
        res += ', ';
      }
    }
    res += ') {\n';

    var offset = 0;
    for (var i = 0; i < res.length; i++) {
      if (res[i] == '\n') offset++;
    }

    res += inputs.code + '\n';
    res += CLOSE_BRACKET;
    res += MAIN_METHOD_HEADER;
    res += OBJECT_INSTIATION;
    res += PRINTSTREAM_INITIALIZATION;
    res += RESULT_STRING;

    for (var i = 0; i < argumentNames.length; i++) {
      res += argumentTypes[i] + ' ' + argumentNames[i] + ';\n'
    }

    for (var i = 0; i < testCases.length; i++) {
      for (var j = 0; j < argumentNames.length; j++) {
        res += argumentNames[j] + ' = ' + testCases[i][j] + ';\n';
      }
      res += '_result += o.' + methodName + '(';
      for (var j = 0; j < argumentNames.length; j++) {
        res += argumentNames[j];
        if (j != argumentNames.length - 1) {
          res += ', ';
        }
      }
      res += ') + "\\n";\n';
    }

    res += OUTPUT_STRING;
    res += CLOSE_BRACKET;
    res += CLOSE_BRACKET;

    return exits.success({code: res, offset: offset});
  }
}
