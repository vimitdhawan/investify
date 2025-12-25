import { Transaction, TransactionDTO, TransactionType } from "@/lib/types/transaction";
import { generateMutualFundId, MutualFund, MutualFundDTO } from "@/lib/types/mutual-fund";
import { generateSchemeId, Scheme, SchemeDTO} from "@/lib/types/scheme";
import { Portfolio, PortfolioDTO } from "@/lib/types/portfolio";
import { getAmficCodeByIsin, getHistoricalNavBySchemeId, getLatestNavBySchemeId } from "./mf";
import { SchemeNav } from "../types/mf";
import fs from "fs/promises";
import path from "path";


const investmentTypes = [TransactionType.Purchase, TransactionType.PurchaseSIP, TransactionType.SwitchIn, TransactionType.SwitchInMerger, TransactionType.DividendReinvestment ];
const withdrawalTypes = [TransactionType.Redemption, TransactionType.SwitchOut, TransactionType.SwitchOutMerger, TransactionType.REVERSAL, TransactionType.DividendPayout];
const realizedProfitWithdrawTypes = [TransactionType.Redemption, TransactionType.SwitchOut, TransactionType.SwitchOutMerger, TransactionType.DividendPayout];
export let mostRecentNavDate: Date | null = null;

async function getRawPortfolio(): Promise<PortfolioDTO> {
  const filePath = path.join(process.cwd(), "mf_details.json");
  const fileContent = await fs.readFile(filePath, "utf-8");
  return JSON.parse(fileContent);
}


// Helper to parse DD-MM-YYYY date strings
function parseDDMMYYYYString(dateStr: string): Date {
  const [day, month, year] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Helper to parse YYYY-MM-DD date strings
function parseYYYYMMDDString(dateStr: string): Date {
  const [year, month, day ] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Helper to format Date object to YYYY-MM-DD string
export function formatDateToYYYYMMDD(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}


function generateTransactionId(schemeId: string, index: number): string {
    return `${schemeId}-${index}`;
}

function mapTransaction(dto: TransactionDTO, schemeId: string, index: number): Transaction {
    const id = generateTransactionId(schemeId, index);
    return {
        id,
        schemeId,
        date: dto.date,
        description: dto.description,
        type: dto.type,
        nav: dto.nav || 0,
        units: dto.units || 0,
        balanceUnits: dto.balance,
    };
}

interface HistoricalData {
    units: number;
    investedAmount: number;
}

function calculateTransactionsUnitCost(
    transactions: Transaction[],
    targetDate: Date
): HistoricalData {
    let unitsHeld = 0;
    let totalCost = 0;
    const purchaseUnits: { units: number; costPerUnit: number }[] = [];

    // Sort transactions by date in ascending order
    const sortedTransactions = [...transactions].sort((a, b) => parseYYYYMMDDString(a.date).getTime() - parseYYYYMMDDString(b.date).getTime());

    for (const tx of sortedTransactions) {
        const txDate = parseYYYYMMDDString(tx.date);

        if (txDate > targetDate) {
            break; // Only consider transactions up to the target date
        }

        if (investmentTypes.includes(tx.type)) {
            const units = tx.units;
            const cost = tx.investedAmount!;
            unitsHeld += units; // Always add investment units
            totalCost += cost; // Always add investment cost
            if (units > 0) {
              purchaseUnits.push({ units, costPerUnit: cost / units });
            }
        } else if (realizedProfitWithdrawTypes.includes(tx.type)) {
            let unitsToWithdraw = Math.abs(tx.units); // Withdrawal units are usually positive, but amount is negative
            while (unitsToWithdraw > 0 && purchaseUnits.length > 0) {
                const firstPurchase = purchaseUnits[0];
                const unitsToProcess = Math.min(unitsToWithdraw, firstPurchase.units);
                unitsHeld -= unitsToProcess;
                totalCost = totalCost - (unitsToProcess * firstPurchase.costPerUnit);
                firstPurchase.units -= unitsToProcess;
                unitsToWithdraw -= unitsToProcess;
                if (firstPurchase.units <= 0) { // Use <= to handle potential floating point inaccuracies
                    purchaseUnits.shift(); // Remove if fully utilized
                }
            }
        } else if (tx.type === TransactionType.REVERSAL) {
            totalCost += tx.withdrawAmount || 0;
            unitsHeld += tx.units;
        }
    }
    return { units: parseFloat(unitsHeld.toFixed(3)), investedAmount: parseFloat(totalCost.toFixed(2)) };
}

export async function getPortfolio() : Promise<Portfolio> {
    return processPortfolio();
}

export async function getLastNDaysPortfolio(days: number): Promise<Portfolio[]> {
  if (!mostRecentNavDate) {
    await processPortfolio(); // Ensure mostRecentNavDate is set
  }

  const promises: Promise<Portfolio>[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const targetDate = new Date(mostRecentNavDate!);
    targetDate.setDate(targetDate.getDate() - i);
    promises.push(processPortfolio(targetDate));
  }
  
  const results = await Promise.all(promises);
  return results;
}


export async function getPortfolioForLastYearByMonth(): Promise<Portfolio[]> {
    if (!mostRecentNavDate) {
        await processPortfolio(); // Ensure mostRecentNavDate is set
    }

    const promises: Promise<Portfolio>[] = [];
    const today = new Date(mostRecentNavDate!);

    for (let i = 0; i < 12; i++) {
        const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
        promises.push(processPortfolio(targetDate));
    }

    const results = await Promise.all(promises);
    return results.sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime()); // sort ascending
}

export async function getLast30DaysPortfolio(): Promise<Portfolio[]> {
  return getLastNDaysPortfolio(30);
}


export async function processPortfolio(date?: Date): Promise<Portfolio> {
    let pf: PortfolioDTO = await getRawPortfolio(); 
    const mutualFunds: MutualFund[] = [];
    let investedAmount = 0;
    let marketValue = 0;
    let absoluteGainLoss = 0;
    let realizedGainLoss = 0;
    for (const mf of pf.mutual_funds) { 
        const mfRes = await processMutualFunds(mf, date);
        mutualFunds.push(mfRes);
        investedAmount += mfRes.investedAmount;
        marketValue += mfRes.marketValue ?? 0;
        absoluteGainLoss += mfRes.absoluteGainLoss ?? 0;
        realizedGainLoss += mfRes.realizedGainLoss ?? 0;
   }
   const gainLossPercentage = (absoluteGainLoss / investedAmount) * 100
   let portfolioDate = mostRecentNavDate
   if(date) {
    portfolioDate = date
   }
   let portfolio: Portfolio = {
        investor: {
            address: pf.investor.address,
            email: pf.investor.email,
            mobile: pf.investor.mobile,
            name: pf.investor.name,
            pan: pf.investor.pan? pf.investor.pan  : "",
        },
        mutualFunds: mutualFunds,
        statementPeriod: {
            from: pf.meta.statement_period.from,
            to:   pf.meta.statement_period.to,
        },
        investedValue: investedAmount,
        marketValue: marketValue,
        absoluteGainLoss: absoluteGainLoss,
        absoluteGainLossPercentage: gainLossPercentage,
        realizedGainLoss: realizedGainLoss,
        date: portfolioDate ? formatDateToYYYYMMDD(portfolioDate) : "",
   }
   return portfolio
}

async function processMutualFunds(mutualFund: MutualFundDTO, date?: Date): Promise<MutualFund> {
    const mfId = generateMutualFundId(mutualFund)
    let investedAmount = 0 
    let marketValue = 0;
    let realizedGainLoss = 0;
    let absoluteGainLoss = 0;
    const schemes: Scheme[] = [];
    for (const scheme of mutualFund.schemes) {
        const schemeRes = await processSchemes(mfId, mutualFund.amc, mutualFund.folio_number, scheme, date);
        schemes.push(schemeRes);
        if (schemeRes.units != 0) {
            investedAmount += schemeRes.investedAmount
            marketValue += schemeRes.marketValue ? schemeRes.marketValue : 0
            absoluteGainLoss += schemeRes.absoluteGainLoss ? schemeRes.absoluteGainLoss : 0
        }
        realizedGainLoss += schemeRes.realizedGainLoss ? schemeRes.realizedGainLoss : 0
    }
    const gainLossPercentage = (absoluteGainLoss / investedAmount) * 100
    return {
        id: mfId,
        name: mutualFund.amc,
        folioNumber: mutualFund.folio_number,
        investedAmount: investedAmount,
        marketValue: marketValue,
        absoluteGainLoss: absoluteGainLoss,
        absoluteGainLossPercentage: gainLossPercentage,
        realizedGainLoss: realizedGainLoss,
        schemes: schemes,
    }
}

async function processSchemes(mfId: string, amc: string, folioNumer: string, scheme: SchemeDTO, reqDate?: Date): Promise<Scheme> {
    const schemeId = generateSchemeId(mfId, scheme)  
    const transactions = processTransactions(scheme.transactions, schemeId)
    let withdrawAmount = transactions
        .filter(tx => realizedProfitWithdrawTypes.includes(tx.type))
        .reduce((sum, tx) => sum + (tx.withdrawAmount ?? 0), 0);   
    if(reqDate && scheme.units > 0) {
        const filteredTransactionByDate = transactions.filter(t => parseYYYYMMDDString(t.date) <= reqDate)
        const historicalData = calculateTransactionsUnitCost(filteredTransactionByDate, reqDate)
        withdrawAmount = filteredTransactionByDate
            .filter(tx => realizedProfitWithdrawTypes.includes(tx.type))
            .reduce((sum, tx) => sum + (tx.withdrawAmount ?? 0), 0);
        if (scheme.units != historicalData.units || Math.trunc(scheme.cost) != Math.trunc(historicalData.investedAmount)) {
            console.log("Historical Data for Scheme:", scheme.name, "Historical Data:", historicalData, "Current Data:", { units: scheme.units, cost: scheme.cost }); 
        }        
        scheme.units = historicalData.units
        scheme.cost = historicalData.investedAmount

    }   
    
    const navByDate = await processNAVDate(scheme.additional_info.amfi, scheme.isin, reqDate)
    const nav = Number(navByDate.nav)
    const date = navByDate.date
    const marketValue = scheme.units * nav
    const gainLoss = marketValue - scheme.cost
    const gainLossPercentage = (gainLoss / scheme.cost) * 100 
    let realizedGainLoss = 0
    if (scheme.units == 0) {
      realizedGainLoss = Math.abs(withdrawAmount) - scheme.cost
    } else {
        const purchases = transactions.filter(t => investmentTypes.includes(t.type) && t.units > 0)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(p => {
                const cost = p.investedAmount ?? (p.nav * p.units);
                return { 
                    ...p, 
                    costPerUnit: cost / p.units!, 
                    remainingUnits: p.units 
                };
            });

        const sales = transactions.filter(t => realizedProfitWithdrawTypes.includes(t.type))
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        for (const sale of sales) {
            let unitsToSell = Math.abs(sale.units);
            const salePricePerUnit = sale.nav;
            for (const purchase of purchases) {
                if (unitsToSell === 0) break;
                if (purchase.remainingUnits! > 0) {
                    const unitsToProcess = Math.min(unitsToSell, purchase.remainingUnits!);
                    realizedGainLoss += unitsToProcess * (salePricePerUnit - purchase.costPerUnit);
                    purchase.remainingUnits! -= unitsToProcess;
                    unitsToSell -= unitsToProcess;
                }
            }
        }
    }

    const res: Scheme =  {
    id: schemeId,
    name: scheme.name,
    amc: amc,
    amfi: scheme.additional_info.amfi,
    isin: scheme.isin,
    mutualFundId: mfId,
    units: scheme.units,
    investedAmount: scheme.cost,
    marketValue: marketValue,
    absoluteGainLoss: gainLoss,
    absoluteGainLossPercentage: gainLossPercentage,
    nav: nav,
    date: date,
    realizedGainLoss: realizedGainLoss,
    xirrGainLoss: 0,
    withdrawAmount: withdrawAmount,
    folioNumber: folioNumer,
    transactions:transactions,
    }
    return res
} 

export async function processNAVDate(amfiCode: string, isin: string, date?: Date): Promise<SchemeNav>  {
    if(!amfiCode) {
        amfiCode = (await getAmficCodeByIsin(isin)).toString()
    }
    if(date) {
        const navs = await getHistoricalNavBySchemeId(amfiCode)
        const requestedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        for(const nav of navs) {
            const navDate = parseDDMMYYYYString(nav.date);
            if (navDate.getTime() === requestedDate.getTime()) {
                return nav
            }
            if(navDate < requestedDate) {
                return nav
            }
        }
    } else {
        const latestNav = await getLatestNavBySchemeId(amfiCode)
        const navDate = parseDDMMYYYYString(latestNav.date); // Use the helper
        if (!mostRecentNavDate || navDate > mostRecentNavDate) {
              mostRecentNavDate = navDate;
          }
        return latestNav
    }
    throw new Error("NAV not found for given date");
}

export async function getTransactionsByScemeId(schemeId: string): Promise<Transaction[]> {
    const portfolio = await processPortfolio()
    let scheme = portfolio.mutualFunds.flatMap(mutualFund => mutualFund.schemes).find(scheme => scheme.id == schemeId);
    if (!scheme) {
        return []
    }
    return scheme.transactions
}

function processInvestment(currentTx: TransactionDTO, allTxs: TransactionDTO[], currentIndex: number, view: Transaction): number {
    view.actualInvestment = currentTx.amount;
    view.investedAmount = currentTx.amount;

    let nextIndex = currentIndex + 1;
    while (nextIndex < allTxs.length) {
        const nextTx = allTxs[nextIndex];
        if (nextTx.date === currentTx.date && nextTx.type === TransactionType.StampDutyTax) {
            view.stampDuty = nextTx.amount;
            view.investedAmount += nextTx.amount;
            nextIndex++;
        } else {
            break;
        }
    }
    return nextIndex;
}

function processWithdrawal(currentTx: TransactionDTO, allTxs: TransactionDTO[], currentIndex: number, view: Transaction): number {
    view.withdrawAmount = currentTx.amount;

    let nextIndex = currentIndex + 1;
    while (nextIndex < allTxs.length) {
        const nextTx = allTxs[nextIndex];
        if (nextTx.date === currentTx.date && nextTx.type === TransactionType.SttTax) {
            view.sttTax = nextTx.amount;
            nextIndex++;
        } else if (nextTx.date === currentTx.date && nextTx.type === TransactionType.TdsTax) {
            view.capitalGainTax = nextTx.amount;
            nextIndex++;
        } else if (nextTx.date === currentTx.date && nextTx.type === TransactionType.StampDutyTax) {
            view.stampDuty = nextTx.amount;
            nextIndex++;
        }else {
            break;
        }
    }
    return nextIndex;
}

function processTransactions(transactionDTOs: TransactionDTO[], schemeId: string): Transaction[] {
  const transactions: Transaction[] = [];
  let i = 0;
  while (i < transactionDTOs.length) {
    const currentTxDto = transactionDTOs[i];

    if (currentTxDto.type === TransactionType.Misc) {
        i++;
        continue;
    }
    const transaction = mapTransaction(currentTxDto, schemeId, i);
    if (investmentTypes.includes(currentTxDto.type)) {
        i = processInvestment(currentTxDto, transactionDTOs, i, transaction);
    } else if (withdrawalTypes.includes(currentTxDto.type)) {
        i = processWithdrawal(currentTxDto, transactionDTOs, i, transaction);
    } else {
        i++;
    }
    transactions.push(transaction);
  }

  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
 }

