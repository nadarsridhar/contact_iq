import { z } from "zod";

export const tradeExceptionSchema = z.object({
  AccountNumber: z.string(),
  BranchName: z.string(),
  BuySellIndicator: z.string(),
  ClientId: z.string(),
  Scrip: z.string(),
  OrderTime: z.string(),
  Exchange: z.string(),
  ClientName: z.string(),
  DealerId: z.string(),
  ExpiryDate: z.string(),
  Instrument: z.string(),
  OptionType: z.string(),
  OrderNumber: z.string(),
  StrikePrice: z.string(),
  Symbol: z.string(),
  TEReportType: z.string(),
  TerminalCode: z.string(),
  UserId: z.string(),
  UserName: z.string(),
  TradeCount: z.number(),
  TradeNumber: z.string(),
  TradeTime: z.number(),
  TradedPrice: z.number(),
  TradedQuantity: z.number(),
  TradedValue: z.number(),
  StartTime: z.number(),
});

export type TradeException = z.infer<typeof tradeExceptionSchema>;
