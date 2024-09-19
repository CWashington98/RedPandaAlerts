import { PublishCommand } from "@aws-sdk/client-sns";

export const constructSMSMessage = (
  env,
  ticker,
  triggerLevel,
  price,
  month
) => {
  try {
    console.log("constructing message - ", env, env.toLowerCase());
    const message = `$${ticker} ${month.toLowerCase()} ${triggerLevel} at $${price} has triggered.`;

    // Use && instead of || to correctly handle the environment check
    if (env.toLowerCase() !== "prod" && env.toLowerCase() !== "production") {
      return "***TEST***\n" + message;
    }
    return message;
  } catch (err) {
    console.error("Error creating SMS message", err);
    throw err;
  }
};

export const sendConfirmationSMS = async (snsClient, phoneNumber, message) => {
  const params = {
    Message: message,
    PhoneNumber: phoneNumber,
  };
  try {
    const data = await snsClient.send(new PublishCommand(params));
    console.log("SMS sent successfully", data);
    return data;
  } catch (err) {
    console.error("Error sending SMS", err);
    throw err;
  }
};
