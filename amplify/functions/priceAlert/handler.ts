import { Handler } from "aws-lambda";
import fetch from 'node-fetch';
import { getUserExpoPushToken } from "@/services/userService";

type PriceAlertEvent = {
  userId: string;
  stockName: string;
  quickEntryPrice: number;
  // Add other relevant fields as needed
};

type LambdaResponse = {
  statusCode: number;
  body: string;
};

const sendPushNotification = async (expoPushToken: string, message: string) => {
  const payload = {
    to: expoPushToken,
    sound: 'default',
    body: message,
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (data?.data && data.data.status === 'ok') {
      console.log('Push notification sent via Expo');
    } else {
      console.error('Error sending push notification via Expo:', data);
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

export const handler: Handler = async (event: any): Promise<LambdaResponse> => {
  try {
    const { userId, stockName, quickEntryPrice } = event.arguments;

    const pushToken = await getUserExpoPushToken(userId);
    if (pushToken) {
      const message = `📈 ${stockName} has reached your Quick Entry Price of $${quickEntryPrice}`;
      await sendPushNotification(pushToken, message);
      console.log('Push notification dispatched successfully.');
    } else {
      console.warn('No push token found for user:', userId);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error("Error in PriceAlert handler:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Failed to send push notification: ${error}` }),
    };
  }
};
