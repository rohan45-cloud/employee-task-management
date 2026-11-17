export function notFound(req, res, _next) {
  res
    .status(404)
    .json({ success: false, message: `Route not found: ${req.originalUrl}` });
}
export function errorHandler(err, _req, res, _next) {
  console.error(err);
  if (err.code === 11000)
    return res
      .status(409)
      .json({
        success: false,
        message: `Duplicate value for ${Object.keys(err.keyValue || {})[0] || "unique field"}.`,
      });
  if (err.name === "ValidationError" || err.name === "CastError")
    return res.status(400).json({ success: false, message: err.message });
  res
    .status(err.status || 500)
    .json({ success: false, message: err.message || "Internal server error" });
}
