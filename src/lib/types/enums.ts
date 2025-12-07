export enum TransactionType {
  Purchase = "PURCHASE",
  PurchaseSIP = "PURCHASE_SIP",
  Redemption = "REDEMPTION",
  SwitchIn = "SWITCH_IN",
  SwitchInMerger = "SWITCH_IN_MERGER",
  SwitchOut = "SWITCH_OUT",
  SwitchOutMerger = "SWITCH_OUT_MERGER",
  DividendPayout = "DIVIDEND_PAYOUT",
  DividendReinvestment = "DIVIDEND_REINVESTMENT",
  Segregation = "SEGREGATION",
  StampDutyTax = "STAMP_DUTY_TAX",
  TdsTax = "TDS_TAX",
  SttTax = "STT_TAX",
  Misc = "MISC",
}

export enum MutualFundType {
  Equity = "EQUITY",
  Debt = "DEBT",
  Hybrid = "HYBRID",
}
