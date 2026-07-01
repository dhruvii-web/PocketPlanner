const normalizePhone = (value) => {
  if (!value) {
    return "";
  }

  const trimmed = String(value).trim().replace(/[\s()-]/g, "");

  if (trimmed.startsWith("+")) {
    return trimmed;
  }

  if (/^[6-9]\d{9}$/.test(trimmed)) {
    return `+91${trimmed}`;
  }

  return trimmed.startsWith("91") && trimmed.length === 12 ? `+${trimmed}` : trimmed;
};

export const sendSms = async ({ to, body }) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  const normalizedTo = normalizePhone(to);

  if (!accountSid || !authToken || !fromNumber) {
    return {
      delivered: false,
      provider: "disabled",
      to: normalizedTo,
      message: "SMS provider not configured",
    };
  }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: normalizedTo,
        From: fromNumber,
        Body: body,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SMS delivery failed: ${errorText}`);
  }

  const data = await response.json();

  return {
    delivered: true,
    provider: "twilio",
    sid: data.sid,
    to: normalizedTo,
  };
};

export const getPublicAppUrl = () => {
  return (
    process.env.PUBLIC_APP_URL ||
    process.env.APP_URL ||
    process.env.CLIENT_URL ||
    "http://localhost:5173"
  ).replace(/\/$/, "");
};