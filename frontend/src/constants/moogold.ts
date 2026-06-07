export const MOOGOLD_ERROR_CODES = {
  "109": "Invalid Signature",
  "110": "Error Occured, please try again",
  "111": "Insufficient balance",
  "113": "Product ID missing",
  "114": "Product out of stock",
  "116": "One order only allow a maximum of 10 quantity",
  "117": "Max quantity exceeded (limit: 10)",
  "118": "Product is blocked",
  "403": "Invalid credentials or unauthorized",
  "418": "Incorrect API path",
  "419": "Missing required arguments",
  "420": "Duplicate partner order ID",
  "421": "Partner order ID not found",
  "422": "Product ID invalid or not authorized",
  "423": "Category ID missing",
  "424": "Invalid payment method",
  "425": "Invalid amount",
  "426": "Timestamp incorrect",
  "433": "IP not allowed",
  "434": "Rate limit exceeded",
  "435": "Invalid status filter",
  "436": "Start date after end date",
  "437": "Date range exceeds 30 days",
  "1111": "Endpoint restricted to members only"
};

export const MOOGOLD_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  REFUNDED: 'refunded',
  INCORRECT_DETAILS: 'incorrect-details',
  FAILED: 'failed'
};
