import { priceTracker } from "./priceTracker";
import { priceAlert } from "./priceAlert";
import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a
  .schema({
    User: a
      .model({
        id: a.id().required(),
        email: a.email().required(),
        phoneNumber: a.phone().required(),
        firstName: a.string().required(),
        lastName: a.string().required(),
        inputPrices: a.hasMany("StockPrice", ["userId"]),
      })
      .authorization((allow) => [
        allow.guest().to(["create"]),
        allow.authenticated(),
      ]),

    StockPrice: a
      .model({
        id: a.id().required(),
        stockName: a.string().required(),
        tickerSymbol: a.string().required(),
        isCrypto: a.boolean().default(false),
        quickEntryPrice: a.float().required(),
        swingTradePrice: a.float().required(),
        loadTheBoatPrice: a.float().required(),
        month: a.string().required(),
        year: a.integer().required(),
        user: a.belongsTo("User", ["userId"]),
      })
      .authorization((allow) => [
        allow.guest().to(["create"]),
        allow.authenticated(),
      ]),
  })
  .authorization((allow) => [
    allow.resource("priceTracker"),
    allow.resource("priceAlert"),
  ]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
