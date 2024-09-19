import fetch from 'node-fetch';

export const sendPushNotification = async (expoPushToken: string, message: string) => {
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