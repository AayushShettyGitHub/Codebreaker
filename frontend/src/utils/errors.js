export function getErrorMessage(err) {
  // Prefer a structured backend message
  let msg = err?.response?.data?.message || err?.response?.data?.error || err?.response?.data || err?.message || "Something went wrong";
  if (typeof msg !== 'string') msg = String(msg);

  // Remove obvious HTTP status code patterns like "HTTP 403", "403", "status: 403" at start of message
  msg = msg.replace(/^\s*(?:HTTP\/\d+\.?\d*\s*)?\d{3}\s*[:\-\)]?\s*/i, '').trim();
  msg = msg.replace(/\bstatus\s*[:=]?\s*\d{3}\b/i, '').trim();

  // Remove leftover double spaces
  msg = msg.replace(/\s{2,}/g, ' ');

  // Fallback message
  if (!msg) msg = "Something went wrong";
  return msg;
}
