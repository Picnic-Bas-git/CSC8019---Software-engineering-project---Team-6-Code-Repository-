/*
  HorsePay helper.

  This file builds the HorsePay payload and sends the payment request
  to the dummy HorsePay API.
*/

function formatHorsePayDate(date = new Date()) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

// Formats the time from locale
function formatHorsePayTime(date = new Date()) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
}

/*
    Sends a payment request to HorsePay.
  
    Returns the parsed HorsePay response JSON.
  */
export async function processHorsePayPayment({
  customerId,
  amount,
  currencyCode = 'GBP',
}) {
  const horsePayUrl = process.env.HORSEPAY_URL;
  const storeID = process.env.HORSEPAY_STORE_ID;
  const timeZone = process.env.HORSEPAY_TIMEZONE || 'GMT';
  const forceStatus = process.env.HORSEPAY_FORCE_STATUS;

  if (!horsePayUrl) {
    throw new Error('HORSEPAY_URL is not set');
  }

  if (!storeID) {
    throw new Error('HORSEPAY_STORE_ID is not set');
  }

  if (!customerId || customerId.length < 5 || customerId.length > 255) {
    throw new Error('HorsePay customerID must be between 5 and 255 characters');
  }

  const payload = {
    storeID,
    customerID: customerId,
    date: formatHorsePayDate(new Date()),
    time: formatHorsePayTime(new Date()),
    timeZone,
    transactionAmount: Number(amount.toFixed(2)),
    currencyCode,
  };

  // developer testing field from HorsePay docs
  if (forceStatus === 'true') {
    payload.forcePaymentSatusReturnType = true;
  } else if (forceStatus === 'false') {
    payload.forcePaymentSatusReturnType = false;
  }

  const res = await fetch(horsePayUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`HorsePay request failed with status ${res.status}`);
  }

  const data = await res.json();
  return data;
}
