import type { NextApiRequest, NextApiResponse } from 'next';
import { sendPushNotification } from '../../../../services/notificationService';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { userId, message } = req.body;

  // Retrieve Expo push token from your database using userId
  const expoPushToken = await getUserExpoPushToken(userId); // Implement this function

  if (!expoPushToken) {
    return res.status(400).json({ error: 'Expo Push Token not found' });
  }

  try {
    await sendPushNotification(expoPushToken, message);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send notification' });
  }
};