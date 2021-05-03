const {validationResult} = require("express-validator/check");

exports.getFlashMessage = (req, name) => {
	const message = req.flash(name);
	if (message.length === 0) return null;
	return message[0];
}

exports.getValidationResult = (req) => {
	const errorArray = validationResult(req).array();
	if (errorArray.length === 0) return null;
	return errorArray[0].msg;
}
