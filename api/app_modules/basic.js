const Component = require("./component.js");
const Restriction = require("./restriction.js");

OPERATION_OPERATOR_LIST = ["+", "-", "*", "/", "%"];

/* Get a random operation operator */
function getRandomOperationOperator() {
	return OPERATION_OPERATOR_LIST[Math.floor(Math.random() * OPERATION_OPERATOR_LIST.length)];
}

/* Instantiate a basic operation node with the given parameters.
   operator is either "+", "-", "*", "/", or "%". */
function getBasicNumberOperation(operator) {
	var res = new Component.node(NODE_TYPE_OPERATION);
	res.operator = operator;
	res.inputOperands = [null, null];
	res.inputOperandRestrictions = [Restriction.RESTRICTION_SMALL_NUMBER(), Restriction.RESTRICTION_SMALL_NUMBER()];
	res.successors = [null];
	// If operator is division or modulo, do not allow second operand to be 0.
	if (operator == "/" || operator == "%") {
		res.inputOperandRestrictions[1].restricted_values = [0];
	}
	return res;
}

module.exports = {getRandomOperationOperator, getBasicNumberOperation};