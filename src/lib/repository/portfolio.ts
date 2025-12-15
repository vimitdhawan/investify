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
export let mostRecentNavDate: Date | null = null;

async function getPortfolio(): Promise<PortfolioDTO> {
  const filePath = path.join(process.cwd(), "mf_details.json");
  const fileContent = await fs.readFile(filePath, "utf-8");
  return JSON.parse(fileContent);
}


// Helper to parse DD-MM-YYYY date strings
function parseDateString(dateStr: string): Date {
  const [day, month, year] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
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

export async function populatePortfolioCache(date?: Date): Promise<Portfolio> {
    let pf: PortfolioDTO = await getPortfolio(); 
    const mutualFunds: MutualFund[] = [];
    let investedAmount = 0;
    let marketValue = 0;
    let absoluteGainLoss = 0;
    let realizedGainLoss = 0;
    for (const mf of pf.mutual_funds) { 
        const mfRes = await populateMutualFundsCache(mf, date);
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
        date: portfolioDate?.toISOString() ?? "",
   }
   return portfolio
}

async function populateMutualFundsCache(mutualFund: MutualFundDTO, date?: Date): Promise<MutualFund> {
    const mfId = generateMutualFundId(mutualFund)
    let investedAmount = 0 
    let marketValue = 0;
    let realizedGainLoss = 0;
    let absoluteGainLoss = 0;
    const schemes: Scheme[] = [];
    for (const scheme of mutualFund.schemes) {
        const schemeId = generateSchemeId(mfId, scheme);
        const schemeRes = await populateSchemeCache(mfId, mutualFund.folio_number, scheme, date);
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

async function populateSchemeCache(mfId: string, folioNumer: string, scheme: SchemeDTO, reqDate?: Date): Promise<Scheme> {
    const schemeId = generateSchemeId(mfId, scheme)
    const transactions = await populateTransactionsCache(schemeId, scheme.transactions)
    const withdrawAmount = [...transactions.values()]
        .filter(tx => withdrawalTypes.includes(tx.type))
        .reduce((sum, tx) => sum + (tx.withdrawAmount ?? 0), 0);
    
    const navByDate = await processNAVDate(scheme.additional_info.amfi, scheme.isin, reqDate)
    const nav = Number(navByDate.nav)
    const date = navByDate.date
    const marketValue = scheme.units * nav
    const gainLoss = marketValue - scheme.cost
    const gainLossPercentage = (gainLoss / scheme.cost) * 100 
    let realizedGainLoss = 0
    if (scheme.units == 0) {
      realizedGainLoss = Math.abs(withdrawAmount) - scheme.cost
    }
    const res: Scheme =  {
    id: schemeId,
    name: scheme.name,
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
    transactions: Array.from(transactions.values())
    }
    return res
} 

export async function processNAVDate(amfiCode: string, isin: string, date?: Date): Promise<SchemeNav>  {
    if(!amfiCode) {
        amfiCode = (await getAmficCodeByIsin(isin)).toString()
    }
    if(date) {
        const navs = await getHistoricalNavBySchemeId(amfiCode)
        for(const nav of navs) {
            const navDate = parseDateString(nav.date);
            if (navDate.toDateString() === date.toDateString()) {
                return nav
            }
            if(navDate < date) {
                return nav
            }
        }
    } else {
        const latestNav = await getLatestNavBySchemeId(amfiCode)
        const navDate = parseDateString(latestNav.date); // Use the helper
        if (!mostRecentNavDate || navDate > mostRecentNavDate) {
              mostRecentNavDate = navDate;
          }
        return latestNav
    }
    throw new Error("NAV not found for given date");
}

async function populateTransactionsCache(schemId: string, transactions: TransactionDTO[]): Promise<Map<string, Transaction>> {
    let transactionByTransactionId = new Map<string, Transaction>();
    const processedTransactions = processSchemeTransactions(transactions, schemId);
    for (const tx of processedTransactions) {
        transactionByTransactionId.set(tx.id, tx);
    }
    return transactionByTransactionId
}

export async function getTransactionsByScemeId(schemeId: string): Promise<Transaction[]> {
    const portfolio = await populatePortfolioCache()
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
        } else {
            break;
        }
    }
    return nextIndex;
}

function processSchemeTransactions(transactionDTOs: TransactionDTO[], schemeId: string): Transaction[] {
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

