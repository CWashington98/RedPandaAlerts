/* Amplify Params - DO NOT EDIT
	API_REDPANDALEVELS_GRAPHQLAPIENDPOINTOUTPUT
	API_REDPANDALEVELS_GRAPHQLAPIIDOUTPUT
	API_REDPANDALEVELS_GRAPHQLAPIKEYOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */
import { SESClient } from "@aws-sdk/client-ses";
import { SNSClient } from "@aws-sdk/client-sns";
import {
  constructSMSMessage,
  sendConfirmationSMS,
} from "./confirmationText.js";
import { unmarshall } from "@aws-sdk/util-dynamodb";

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

export const handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  const ENVIRONMENT = process.env.ENV || "dev";
  console.log("ENVIRONEMENT: ", ENVIRONMENT);
  const sesClient = new SESClient({ region: process.env.AWS_REGION });
  const snsClient = new SNSClient({ region: process.env.AWS_REGION });

  // Process each record in the event
  const processRecords = event.Records.filter(
    (record) => record.eventName === "MODIFY"
  ).map(async (record) => {
    console.log(record.eventID);
    console.log(record.eventName);
    console.log("DynamoDB Record: %j", record.dynamodb);

    // Extracting NewImage and OldImage
    const newImage = unmarshall(record.dynamodb.NewImage);
    const oldImage = unmarshall(record.dynamodb.OldImage);
    const ticker = newImage.ticker;
    const month = newImage.month;

    // Prepare an array of promises for sending SMS for each entry
    const smsPromises = [
      { name: "Load The Boat", key: "loadTheBoatEntry" },
      { name: "Swing Trade", key: "swingTradeEntry" },
      { name: "Fast Entry", key: "fastEntry" },
    ].map((entry) => {
      const oldHit = oldImage[entry.key]?.hit || false; // Fallback to false if undefined
      const newHit = newImage[entry.key]?.hit || false;

      if (!oldHit && newHit) {
        // Check for a change from false to true
        console.log(`Triggered: ${entry.name} for ${ticker}`);
        const message = constructSMSMessage(
          ENVIRONMENT,
          ticker,
          entry.name,
          newImage[entry.key]?.price,
          month
        );
        console.log("SMS message to be sent ", message);
        return Promise.all([
          sendConfirmationSMS(snsClient, "+15403265001", message),
          sendConfirmationSMS(snsClient, "+14129963227", message),
        ]); // Replace with dynamic number retrieval logic
      }

      return Promise.resolve(); // Return a resolved promise for non-triggering entries
    });

    // Wait for all SMS sending promises to resolve
    return Promise.all(smsPromises);
  });

  // Wait for all records to be processed
  await Promise.all(processRecords);

  return "Successfully processed DynamoDB record";
};
