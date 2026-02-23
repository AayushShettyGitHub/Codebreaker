export function getErrorMessage(err) {
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
  } else if (typeof err?.response?.data === 'string') {
    msg = err.response.data;
  } else if (err?.message) {
    msg = err.message;
  } else {
    msg = "Something went wrong";
  }
  
  if (typeof msg !== 'string') msg = String(msg);

  
  msg = msg.replace(/^\s*(?:HTTP\/\d+\.?\d*\s*)?\d{3}\s*[:\-\)]?\s*/i, '').trim();
  msg = msg.replace(/\bstatus\s*[:=]?\s*\d{3}\b/i, '').trim();

  
  msg = msg.replace(/\s{2,}/g, ' ');

  
  if (!msg) msg = "Something went wrong";
  return msg;
}
