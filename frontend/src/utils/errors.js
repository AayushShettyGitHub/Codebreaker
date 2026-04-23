/**
 * Detects if a response body is raw HTML (e.g. nginx 502/503/504 error pages)
 * and returns a user-friendly message instead.
 */
function isHtmlErrorResponse(data) {
  if (typeof data !== 'string') return false;
  const trimmed = data.trim().toLowerCase();
  return (
    trimmed.startsWith('<!doctype') ||
    trimmed.startsWith('<html') ||
    trimmed.startsWith('<head') ||
    trimmed.startsWith('<body')
  );
}

/**
 * Maps HTTP status codes to user-friendly messages so raw
 * server/proxy errors never leak into the UI.
 */
function getFriendlyStatusMessage(status) {
  if (!status) return null;
  const map = {
    400: "The request was invalid. Please check your input and try again.",
    401: "Your session has expired. Please log in again.",
    403: "You don't have permission to perform this action.",
    404: "The requested resource was not found.",
    408: "The request timed out. Please try again.",
    409: "There was a conflict with your request. Please refresh and try again.",
    429: "Too many requests. Please wait a moment and try again.",
    500: "Something went wrong on our end. Please try again later.",
    502: "Our servers are temporarily unreachable. Please try again in a moment.",
    503: "The service is temporarily unavailable. Please try again shortly.",
    504: "The server took too long to respond. Please try again.",
  };
  return map[status] || null;
}

export function getErrorMessage(err) {
  // 1. If the response body is raw HTML (e.g. nginx error page), never show it
  if (err?.response?.data && isHtmlErrorResponse(err.response.data)) {
    return getFriendlyStatusMessage(err.response?.status)
      || "Something went wrong. Please try again later.";
  }

  // 2. If the status code itself indicates a server/proxy issue (5xx),
  //    prefer a friendly message over whatever the backend sent
  const status = err?.response?.status;
  if (status && status >= 500) {
    return getFriendlyStatusMessage(status)
      || "Something went wrong. Please try again later.";
  }

  // 3. Try to extract a structured error message from the response
  let msg = "";

  if (err?.response?.data?.error?.message) {
    msg = err.response.data.error.message;

    if (err?.response?.data?.details && Object.keys(err.response.data.details).length > 0) {
      const details = Object.entries(err.response.data.details)
        .map(([field, message]) => `${field}: ${message}`)
        .join(', ');
      msg = msg + " (" + details + ")";
    }
  }

  else if (err?.response?.data?.message) {
    msg = err.response.data.message;
  } else if (err?.response?.data?.error) {
    msg = typeof err.response.data.error === 'string'
      ? err.response.data.error
      : err.response.data.error.message || "Validation error";
  } else if (typeof err?.response?.data === 'string' && !isHtmlErrorResponse(err.response.data)) {
    msg = err.response.data;
  } else if (err?.code === 'ERR_NETWORK' || err?.message?.toLowerCase().includes('network')) {
    return "Unable to connect to the server. Please check your connection.";
  } else if (err?.message) {
    msg = err.message;
  } else {
    msg = "Something went wrong";
  }

  if (typeof msg !== 'string') msg = String(msg);

  // Strip HTTP status prefixes from messages
  msg = msg.replace(/^\s*(?:HTTP\/\d+\.?\d*\s*)?\d{3}\s*[:\-\)]\s*/i, '').trim();
  msg = msg.replace(/\bstatus\s*[:=]?\s*\d{3}\b/i, '').trim();

  // Collapse whitespace
  msg = msg.replace(/\s{2,}/g, ' ');

  if (!msg) msg = "Something went wrong";
  return msg;
}
