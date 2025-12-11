import { PortfolioDTO, PortfolioSummary, TransactionDTO, SchemeDTO, TransactionView } from "@/lib/types/portfolio";
import { getAllMutualFundSchemes } from "@/lib/repository/mf";
import { DashboardSummary, FundHouseSummary, SchemeSummary } from "@/lib/types/summary";
import { fetchLatestNavData, getSchemeNavOnDate, historicalNavCache } from "@/lib/mfapi";
import { TransactionType } from "@/lib/types/enums";
import fs from "fs/promises";
import path from "path";

// Helper to parse DD-MM-YYYY date strings
function parseDateString(dateStr: string): Date {
  const [day, month, year] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export async function getPortfolio(): Promise<PortfolioDTO> {
  const filePath = path.join(process.cwd(), "mf_details.json");
  const fileContent = await fs.readFile(filePath, "utf-8");
  return JSON.parse(fileContent);
}


export async function getUpdatedPortfolio(): Promise<PortfolioDTO> {
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

  let mostRecentNavDate: Date | null = null;

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
      
      scheme.schemeCode = schemeCode;

      try {
        const navData = await fetchLatestNavData(schemeCode);
        if (navData && navData.data && navData.data.length > 0) {
          const latestNavEntry = navData.data[0];
          const latestNav = parseFloat(latestNavEntry.nav);
          const navDate = parseDateString(latestNavEntry.date); // Use the helper
          scheme.latestNavDate = latestNavEntry.date;

          if (!mostRecentNavDate || navDate > mostRecentNavDate) {
              mostRecentNavDate = navDate;
          }
          
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

  if (mostRecentNavDate) {
    // Store date in a consistent, parsable format
    portfolio.latestNavDate = mostRecentNavDate.toISOString().split('T')[0];
  }

  return portfolio;
}

export async function getPortfolioSummaryWithPrevDay(): Promise<DashboardSummary> {
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
    const absoluteGainLossPercentage = investedValue > 0 ? (absoluteGainLoss / investedValue) * 100 : 0;

    let prevDayValue: number | undefined = undefined;
    let prevDayChange: number | undefined = undefined;
    let prevDayChangePercentage: number | undefined = undefined;

    const prevValueData = await getPreviousHistoricalPortfolioValue(portfolio);
    if (prevValueData) {
        prevDayValue = prevValueData.value;
        prevDayChange = marketValue - prevDayValue;
        prevDayChangePercentage = prevDayValue > 0 ? (prevDayChange / prevDayValue) * 100 : 0;
    }

    return {
        investedValue,
        marketValue,
        absoluteGainLoss,
        absoluteGainLossPercentage,
        realizedProfit,
        latestNavDate: portfolio.latestNavDate,
        prevDayValue,
        prevDayChange,
        prevDayChangePercentage,
    };
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
            let withdrawalAmount = 0;

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
                withdrawalAmount += t.amount;
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

            let prevDayNavValue: number | undefined;
            let prevDayChangePercentage: number | undefined;

            const navHistory = historicalNavCache.get(scheme.schemeCode || "");
            if (navHistory && navHistory.length > 1 && scheme.nav !== undefined) { // Check for undefined scheme.nav
                const secondLatestNavEntry = navHistory[1]; // Second latest NAV entry
                const secondLatestNav = parseFloat(secondLatestNavEntry.nav);
                
                if (secondLatestNav > 0) {
                    prevDayNavValue = secondLatestNav;
                    prevDayChangePercentage = ((scheme.nav - prevDayNavValue) / prevDayNavValue) * 100;
                }
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
                latestNavDate: scheme.latestNavDate,
                navValue: scheme.nav,
                totalAvailableUnits: scheme.units,
                withdrawalAmount,
                prevDayNavValue,
                prevDayChangePercentage,
            };
            summaries.push(summary);
        }
    }
    
    return summaries;
}

export async function getFundHouseSummary(): Promise<FundHouseSummary[]> {
    const portfolio = await getUpdatedPortfolio();
    const fundHouseMap = new Map<string, FundHouseSummary>();

    for (const mutualFund of portfolio.mutual_funds) {
        const amc = mutualFund.amc;
        let fundHouseSummary = fundHouseMap.get(amc);

        if (!fundHouseSummary) {
            fundHouseSummary = {
                amc,
                investedValue: 0,
                marketValue: 0,
                absoluteGainLoss: 0,
                absoluteGainLossPercentage: 0, // This will be recalculated later
                realizedProfit: 0,
            };
            fundHouseMap.set(amc, fundHouseSummary);
        }

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

            if (scheme.additional_info.close_units === 0) {
                marketValue = 0;
                absoluteGainLoss = 0;
            }

            fundHouseSummary.investedValue += investedValue;
            fundHouseSummary.marketValue += marketValue;
            fundHouseSummary.absoluteGainLoss += absoluteGainLoss;
            fundHouseSummary.realizedProfit += realizedProfit;
        }
    }

    // Recalculate percentage for each fund house summary
    fundHouseMap.forEach(summary => {
        if (summary.investedValue > 0) {
            summary.absoluteGainLossPercentage = (summary.absoluteGainLoss / summary.investedValue) * 100;
        } else {
            summary.absoluteGainLossPercentage = 0;
        }
    });

    return Array.from(fundHouseMap.values());
}

export async function getHistoricalPortfolioValue(portfolio: PortfolioDTO, date: string): Promise<number> {
    let totalHistoricalValue = 0;

    for (const mutualFund of portfolio.mutual_funds) {
        for (const scheme of mutualFund.schemes) {
            if (scheme.schemeCode) {
                const navData = await getSchemeNavOnDate(scheme.schemeCode, date);
                if (navData) {
                    totalHistoricalValue += navData.nav * scheme.units;
                }
            }
        }
    }

    return totalHistoricalValue;
}

export async function getPreviousHistoricalPortfolioValue(portfolio: PortfolioDTO): Promise<{value: number, date: string} | null> {
    let totalHistoricalValue = 0;
    let prevNavDate: Date | null = null;

    for (const mutualFund of portfolio.mutual_funds) {
        for (const scheme of mutualFund.schemes) {
            if (scheme.schemeCode) {
                const navHistory = historicalNavCache.get(scheme.schemeCode);
                if (navHistory && navHistory.length > 1) {
                    const prevNavEntry = navHistory[1];
                    totalHistoricalValue += parseFloat(prevNavEntry.nav) * scheme.units;

                    const entryDate = parseDateString(prevNavEntry.date);
                    if (!prevNavDate || entryDate > prevNavDate) {
                        prevNavDate = entryDate;
                    }
                }
            }
        }
    }
    if (prevNavDate) {
      return { value: totalHistoricalValue, date: prevNavDate.toISOString().split('T')[0] };
    }
    return null;
}

export async function getTransactionsByIsinAndFolio(isin: string, folio_number: string): Promise<TransactionDTO[]> {
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


export async function getTransactionViewsByIsinAndFolio(isin: string, folio_number: string): Promise<TransactionView[]> {
    const transactions = await getTransactionsByIsinAndFolio(isin, folio_number);
    return getTransactionViews(transactions);
}

export function getTransactionViews(transactions: TransactionDTO[]): TransactionView[] {
  // Group transactions by date
  const groupedByDate = transactions.reduce((acc, tx) => {
    if (!acc[tx.date]) {
      acc[tx.date] = [];
    }
    acc[tx.date].push(tx);
    return acc;
  }, {} as Record<string, TransactionDTO[]>);

  const views: TransactionView[] = [];

  // Process each date group
  for (const date in groupedByDate) {
    const dailyTxs = groupedByDate[date];
    // Sort transactions within the day to ensure consistent order
    dailyTxs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let k = 0;
    while (k < dailyTxs.length) {
      const currentTx = dailyTxs[k];
      let view: TransactionView = {
        date: currentTx.date,
        description: currentTx.description,
        type: currentTx.type,
        nav: currentTx.nav,
        units: currentTx.units,
        balance: currentTx.balance,
      };

      if (
        currentTx.type === TransactionType.Purchase ||
        currentTx.type === TransactionType.PurchaseSIP ||
        currentTx.type === TransactionType.SwitchIn ||
        currentTx.type === TransactionType.SwitchInMerger
      ) {
        view.actualInvestment = currentTx.amount;
        view.investedAmount = currentTx.amount;

        let nextK = k + 1;
        while (nextK < dailyTxs.length) {
          const nextTx = dailyTxs[nextK];
          if (nextTx.date === currentTx.date && nextTx.type === TransactionType.StampDutyTax) {
            view.stampDuty = nextTx.amount;
            view.investedAmount += nextTx.amount;
            nextK++;
          } else if (nextTx.date === currentTx.date && nextTx.type === TransactionType.SttTax) {
            view.sttTax = nextTx.amount;
            view.investedAmount += nextTx.amount;
            nextK++;
          } else {
            break;
          }
        }
        k = nextK;
      } else if (
        currentTx.type === TransactionType.Redemption ||
        currentTx.type === TransactionType.SwitchOut ||
        currentTx.type === TransactionType.SwitchOutMerger
      ) {
        view.withdrawAmount = currentTx.amount;

        let nextK = k + 1;
        while (nextK < dailyTxs.length) {
          const nextTx = dailyTxs[nextK];
          if (nextTx.date === currentTx.date && nextTx.type === TransactionType.SttTax) {
            view.sttTax = nextTx.amount;
            nextK++;
          } else if (nextTx.date === currentTx.date && nextTx.type === TransactionType.TdsTax) {
            view.ltcgStcgTax = nextTx.amount;
            nextK++;
          } else {
            break;
          }
        }
        k = nextK;
      } else {
        // Handle other transaction types individually
        if (currentTx.type === TransactionType.DividendPayout) {
          view.withdrawAmount = currentTx.amount;
        } else if (currentTx.type === TransactionType.DividendReinvestment) {
          view.investedAmount = currentTx.amount;
        }
        k++;
      }
      views.push(view);
    }
  }

  // Sort final views by date descending
  return views.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}