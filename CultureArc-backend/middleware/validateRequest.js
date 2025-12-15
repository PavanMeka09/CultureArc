const { ZodError } = require('zod');

/**
 * Middleware factory for validating request body against a Zod schema
 * @param {import('zod').ZodSchema} schema - The Zod schema to validate against
 * @returns {Function} Express middleware function
 */
const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            // Parse and validate request body
            const validatedData = schema.parse(req.body);
            // Replace req.body with validated/transformed data
            req.body = validatedData;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                // Format Zod errors into readable messages
                const errorMessages = error.errors.map(err => {
                    const field = err.path.join('.');
                    return field ? `${field}: ${err.message}` : err.message;
                });

                res.status(400).json({
                    message: 'Validation failed',
                    errors: errorMessages
                });
            } else {
                // Pass other errors to error handler
                next(error);
            }
        }
    };
};

module.exports = { validateRequest };
