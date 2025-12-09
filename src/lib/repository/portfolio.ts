import { Portfolio, PortfolioSummary, Transaction, Scheme } from "@/lib/types/portfolio";
import { getAllMutualFundSchemes, getSchemeNav } from "@/lib/repository/mf";
import { FundHouseSummary, SchemeSummary } from "@/lib/types/summary";
import { TransactionType, MutualFundType } from "@/lib/types/enums";
import fs from "fs/promises";
import path from "path";

export async function getPortfolio(): Promise<Portfolio> {
  const filePath = path.join(process.cwd(), "mf_details.json");
  const fileContent = await fs.readFile(filePath, "utf-8");
  return JSON.parse(fileContent);
}


export async function getUpdatedPortfolio(): Promise<Portfolio> {
  const portfolio = await getPortfolio();
  const allSchemes = await getAllMutualFundSchemes();

  const schemeMap = new Map<string, number>();
  for (const scheme of allSchemes) {
    if (scheme.isinGrowth) {
      schemeMap.set(scheme.isinGrowth, scheme.schemeCode);
    }
    if (scheme.isinDivReinvestment) {
        schemeMap.set(scheme.isinDivReinvestment, scheme.schemeCode);
    }
  }

  for (const mutualFund of portfolio.mutual_funds) {
    for (const scheme of mutualFund.schemes) {
      const rawCode = scheme?.additional_info?.amfi;
      let schemeCode = rawCode ? String(rawCode) : "";

      if (!schemeCode || schemeCode.trim() === "") {
        const isin = scheme.isin;
        if (schemeMap.has(isin)) {
            schemeCode = String(schemeMap.get(isin));
        } else {
            console.warn(`Could not find AMFI code for scheme: ${scheme.name} (${isin})`);
            continue;
        }
      }
      
      try {
        const navData = await getSchemeNav(schemeCode);
        if (navData.data && navData.data.length > 0) {
          const latestNav = parseFloat(navData.data[0].nav);
          
          scheme.nav = latestNav;
          scheme.value = latestNav * scheme.units;
          scheme.gain.absolute = scheme.value - scheme.cost;
          if (scheme.cost > 0) {
              scheme.gain.percentage = (scheme.gain.absolute / scheme.cost) * 100;
          } else {
              scheme.gain.percentage = 0;
          }

        } else {
            console.warn(`No NAV data found for scheme: ${scheme.name} (${schemeCode})`);
        }
      } catch (error) {
        console.error(`Error fetching NAV for scheme ${scheme.name}:`, error);
      }
    }
  }

  return portfolio;
}

export async function getPortfolioSummary(): Promise<PortfolioSummary> {
    const portfolio = await getUpdatedPortfolio();

    let investedValue = 0;
    let marketValue = 0;
    let realizedProfit = 0;

    for (const mutualFund of portfolio.mutual_funds) {
        for (const scheme of mutualFund.schemes) {
            const purchaseTransactions = scheme.transactions.filter(t => t.type === TransactionType.PurchaseSIP || t.type === TransactionType.Purchase || t.type === TransactionType.SwitchIn);
            const redemptionTransactions = scheme.transactions.filter(t => t.type === TransactionType.Redemption || t.type === TransactionType.SwitchOut);

            let totalUnitsPurchased = 0;
            let totalCost = 0;

            for (const t of purchaseTransactions) {
                if (t.units && t.nav) {
                    totalUnitsPurchased += t.units;
                    totalCost += t.units * t.nav;
                }
            }
            
            scheme.avgNav = totalUnitsPurchased > 0 ? totalCost / totalUnitsPurchased : 0;

            for (const t of redemptionTransactions) {
                if (t.units && t.nav) {
                    realizedProfit += (t.nav - scheme.avgNav) * Math.abs(t.units);
                }
            }

            if (scheme.additional_info.close_units !== 0) {
                investedValue += scheme.cost;
                marketValue += scheme.value;
            }
        }
    }

    const absoluteGainLoss = marketValue - investedValue;

    const absoluteGainLossPercentage =
        investedValue > 0 ? (absoluteGainLoss / investedValue) * 100 : 0;

    return {
        investedValue,
        marketValue,
        absoluteGainLoss,
        absoluteGainLossPercentage,
        realizedProfit,
    };
}

export async function getFundHouseSummary(): Promise<FundHouseSummary[]> {
    const portfolio = await getUpdatedPortfolio();
    const summary: { [amc: string]: FundHouseSummary } = {};

    for (const mutualFund of portfolio.mutual_funds) {
        const amc = mutualFund.amc;
        if (!summary[amc]) {
            summary[amc] = {
                amc,
                investedValue: 0,
                marketValue: 0,
                absoluteGainLoss: 0,
                absoluteGainLossPercentage: 0,
                realizedProfit: 0,
            };
        }

        for (const scheme of mutualFund.schemes) {
            const purchaseTransactions = scheme.transactions.filter(t => t.type === TransactionType.PurchaseSIP || t.type === TransactionType.Purchase || t.type === TransactionType.SwitchIn);
            const redemptionTransactions = scheme.transactions.filter(t => t.type === TransactionType.Redemption || t.type === TransactionType.SwitchOut);

            let totalUnitsPurchased = 0;
            let totalCost = 0;

            for (const t of purchaseTransactions) {
                if (t.units && t.nav) {
                    totalUnitsPurchased += t.units;
                    totalCost += t.units * t.nav;
                }
            }
            
            scheme.avgNav = totalUnitsPurchased > 0 ? totalCost / totalUnitsPurchased : 0;

            for (const t of redemptionTransactions) {
                if (t.units && t.nav) {
                    summary[amc].realizedProfit += (t.nav - scheme.avgNav) * Math.abs(t.units);
                }
            }

            if (scheme.additional_info.close_units !== 0) {
                summary[amc].investedValue += scheme.cost;
                summary[amc].marketValue += scheme.value;
                summary[amc].absoluteGainLoss += scheme.gain.absolute;
            }
        }
    }
    
    // Calculate percentage at the end
    for (const amc in summary) {
        if (summary[amc].investedValue > 0) {
            summary[amc].absoluteGainLossPercentage = (summary[amc].absoluteGainLoss / summary[amc].investedValue) * 100;
        }
    }

    return Object.values(summary);
}

export async function getSchemeSummary(): Promise<SchemeSummary[]> {
    const portfolio = await getUpdatedPortfolio();
    
    const summaries: SchemeSummary[] = [];

    for (const mutualFund of portfolio.mutual_funds) {
        for (const scheme of mutualFund.schemes) {
            let realizedProfit = 0;
            const purchaseTransactions = scheme.transactions.filter(t => t.type === TransactionType.PurchaseSIP || t.type === TransactionType.Purchase || t.type === TransactionType.SwitchIn);
            const redemptionTransactions = scheme.transactions.filter(t => t.type === TransactionType.Redemption || t.type === TransactionType.SwitchOut);

            let totalUnitsPurchased = 0;
            let totalCost = 0;

            for (const t of purchaseTransactions) {
                if (t.units && t.nav) {
                    totalUnitsPurchased += t.units;
                    totalCost += t.units * t.nav;
                }
            }
            
            scheme.avgNav = totalUnitsPurchased > 0 ? totalCost / totalUnitsPurchased : 0;

            for (const t of redemptionTransactions) {
                if (t.units && t.nav) {
                    realizedProfit += (t.nav - scheme.avgNav) * Math.abs(t.units);
                }
            }
            
            const investedValue = scheme.cost;
            let marketValue = scheme.value;
            let absoluteGainLoss = scheme.gain.absolute;
            let absoluteGainLossPercentage = scheme.gain.percentage;

            if (scheme.additional_info.close_units === 0) {
                marketValue = 0;
                absoluteGainLoss = 0;
                absoluteGainLossPercentage = (realizedProfit / investedValue) * 100;
            }

            const summary: SchemeSummary = {
                amc: mutualFund.amc,
                folio_number: mutualFund.folio_number,
                schemeName: scheme.name,
                isin: scheme.isin,
                investedValue,
                marketValue,
                absoluteGainLoss,
                absoluteGainLossPercentage,
                realizedProfit: realizedProfit,
            };
            summaries.push(summary);
        }
    }
    
    return summaries;
}

export async function getTransactionsByIsinAndFolio(isin: string, folio_number: string): Promise<Transaction[]> {
    const portfolio = await getPortfolio();
    const mutualFund = portfolio.mutual_funds.find(mf => mf.folio_number === folio_number);
    if (mutualFund) {
        const foundScheme = mutualFund.schemes.find(s => s.isin === isin);
        if (foundScheme) {
            return foundScheme.transactions;
        }
    }
    return [];
}