import { Handler } from "aws-lambda";

export const handler: Handler = async (event: any) => {
  // Function implementation goes here
  return {
    statusCode: 200,
    body: JSON.stringify("Hello from Lambda!"),
  };
};
