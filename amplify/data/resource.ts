import { priceTracker } from "../functions/priceTracker/resource";
import { priceAlert } from "../functions/priceAlert/resource";
import { stockDataProcessor } from "../functions/stockDataProcessor/resource";
import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a
  .schema({
    ProcessedStockData: a.customType({
      stockName: a.string().required(),
      tickerSymbol: a.string().required(),
      isCrypto: a.boolean().required(),
      quickEntryPrice: a.float().required(),
      swingTradePrice: a.float().required(),
      loadTheBoatPrice: a.float().required(),
      month: a.string().required(),
      year: a.integer().required(),
    }),

    StockDataProcessorResponse: a.customType({
      statusCode: a.integer().required(),
      body: a.string().required(),
    }),

    User: a
      .model({
        id: a.id().required(),
        email: a.email().required(),
        phoneNumber: a.phone().required(),
        firstName: a.string().required(),
        lastName: a.string().required(),
        inputPrices: a.hasMany("StockPrice", ["userId"]),
        alertFrequency: a.string().default("daily"),
      })
      .secondaryIndexes((index) => [index("phoneNumber"), index("email")])
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
        quickEntryHit: a.boolean().default(false),
        swingTradePrice: a.float().required(),
        swingTradeHit: a.boolean().default(false),
        loadTheBoatPrice: a.float().required(),
        loadTheBoatHit: a.boolean().default(false),
        month: a.string().required(),
        year: a.integer().required(),
        User: a.belongsTo("User", ["userId"]),
        userId: a.id().required(),
      })
      .secondaryIndexes((index) => [
        index("stockName"),
        index("tickerSymbol"),
        index("month"),
        index("year"),
        index("userId"),
      ])
      .authorization((allow) => [
        allow.guest().to(["create"]),
        allow.authenticated(),
      ]),

    processStockData: a
      .query()
      .authorization((allow) => [allow.authenticated()])
      .arguments({
        stockData: a.string().required(),
        userId: a.id().required(),
      })
      .handler(a.handler.function(stockDataProcessor))
      .returns(a.ref("StockDataProcessorResponse").required()),
  })
  .authorization((allow) => [
    allow.resource(priceTracker),
    allow.resource(priceAlert),
    allow.resource(stockDataProcessor),
  ]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
