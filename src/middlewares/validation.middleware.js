const {body, param, query, validationResult} = require('express-validator');

const registerUserValidationRules = [
    body("username")
        .isString()
        .withMessage("Username must be a string")
        .isLength({min: 3, max: 20})
        .withMessage("Username must be between 3 and 20 characters"),
    
    body("email")
        .isEmail()
        .withMessage("Must be a valid email address")
        .normalizeEmail(),
    
    body("password")
        .isLength({min: 6})
        .withMessage("Password must be at least 6 characters long"),
    
    body("role")
        .optional()
        .isIn(["user", "artist"])
        .withMessage("Role must be either 'user' or 'artist'")
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if(!errors.isEmpty()) {
        return res.status(400).json({
            message: "Validation failed",
            errors: errors.array()
        });
    }
    
    next();
};

module.exports = {
    registerUserValidationRules,
    handleValidationErrors
};