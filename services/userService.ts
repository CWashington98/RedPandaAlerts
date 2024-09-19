import { generateClient } from "aws-amplify/api";
import { Schema } from "@/amplify/data/resource";
const client = generateClient<Schema>();

export const getUserExpoPushToken = async (userId: string): Promise<string | null> => {
  try {
    const user = await client.models.User.get({ id: userId });
    return user.data?.pushToken || null;
  } catch (error) {
    console.error('Error fetching user push token:', error);
    return null;
  }
};

export const updateUserPushToken = async (userId: string, pushToken: string): Promise<void> => {
  try {
    await client.models.User.update({
      id: userId,
      pushToken,
    });
  } catch (error) {
    console.error('Error updating user push token:', error);
    throw error;
  }
};