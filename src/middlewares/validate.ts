import { Request, Response, NextFunction } from "express";

export const validate = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    // Loop through the schema rules defined for each field
    for (const key in schema) {
      const rule = schema[key]; // Gets the validation rules for the current field (e.g., { required: true, type: "string" })
      const value = req.body[key]; // Gets the actual value submitted in the request body for this field

      // 1. Check if the field is required and if it's missing or empty
      if (rule.required && (value === undefined || value === null || value === "")) {
        errors.push(`${key} is required`);
        continue; // Move to the next field if this one is missing and required
      }

      // 2. If the field has a value (it might be optional and not present)
      if (value !== undefined && value !== null) {
        // Check the data type
        if (rule.type && typeof value !== rule.type) {
          errors.push(`${key} must be a ${rule.type}`);
        }

        // Check minimum length for strings
        if (rule.minLength && typeof value === "string" && value.length < rule.minLength) {
          errors.push(`${key} must have at least ${rule.minLength} characters`);
        }

        // Check minimum value for numbers
        if (rule.min !== undefined && typeof value === "number" && value < rule.min) {
          errors.push(`${key} must be greater than or equal to ${rule.min}`);
        }

        // Add more rules here as needed (e.g., maxLength, pattern, etc.)
      }
    }

    // If any errors were found, send a 400 Bad Request response
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    // If all checks pass, proceed to the next middleware or route handler
    next();
  };
};
