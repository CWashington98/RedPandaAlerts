import type { NextApiRequest, NextApiResponse } from 'next';
import { updateUserPushToken } from '../../../../services/userService'; // Implement this service

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, pushToken } = req.body;

  if (!userId || !pushToken) {
    return res.status(400).json({ error: 'userId and pushToken are required' });
  }

  try {
    await updateUserPushToken(userId, pushToken);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating push token:', error);
    res.status(500).json({ error: 'Failed to update push token' });
  }
};