import pkg from "@prisma/client";
const { Prisma } = pkg;
import { ZodError } from "zod";

export function errorHandler(err, req, res, next) {
  console.error(`Error occurred: ${err.message}`, {
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body
  });

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({ 
        error: "CONFLICT", 
        message: "A record with this data already exists" 
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ 
        error: "NOT_FOUND", 
        message: "Record not found" 
      });
    }
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    const firstIssue = err.errors?.[0];
    const fieldPath = firstIssue?.path?.join(".") || "input";
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: firstIssue?.message || "Invalid input data",
      field: fieldPath,
      details: err.errors
    });
  }

  const status = err.status || 500;
  const code = err.code || "INTERNAL_ERROR";
  const message = err.message || "An unexpected error occurred";

  res.status(status).json({ error: code, message });
}
