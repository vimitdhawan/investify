import {
  TransactionView,
  Transaction,
  TransactionType,
  investmentTypes,
  withdrawTypes,
} from '@/lib/types/transaction';
import { MutualFundView } from '@/lib/types/mutual-fund';
import { SchemeView, Scheme } from '@/lib/types/scheme';
import {
  PortfolioView,
  Portfolio,
  Investor,
  Statement,
} from '@/lib/types/portfolio';
import {
  getAmficCodeByIsin,
  getHistoricalNavBySchemeId,
  getLatestNavBySchemeId,
} from '@/lib/repository/mf';
import { SchemeNav } from '@/lib/types/mf';
import { firestore } from '@/lib/firebase';
import xirr from 'xirr';

export let mostRecentNavDate: Date | null = null;

// Helper to parse DD-MM-YYYY date strings
function parseDDMMYYYYString(dateStr: string): Date {
  const [day, month, year] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Helper to parse YYYY-MM-DD date strings
function parseYYYYMMDDString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Helper to format Date object to YYYY-MM-DD string
export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function getPortfolioFromFirestore(
  userId: string
): Promise<Portfolio | null> {
  const userRef = firestore.collection('users').doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    console.error('No user found with ID:', userId);
    return null;
  }

  const investor = userDoc.data() as Investor;

  const statementsRef = userRef.collection('statements');
  const statementsSnap = await statementsRef.get();
  const statements = statementsSnap.docs.map((doc) => doc.data() as Statement);

  const schemesRef = userRef.collection('schemes');
  const schemesSnap = await schemesRef.get();

  const schemePromises = schemesSnap.docs.map(async (schemeDoc) => {
    const schemeData = schemeDoc.data();

    const transactionsRef = schemeDoc.ref.collection('transactions');
    const transactionsSnap = await transactionsRef.get();
    const transactions = transactionsSnap.docs.map(
      (txDoc) => txDoc.data() as Transaction
    );

    return {
      ...(schemeData as Scheme),
      id: schemeDoc.id,
      transactions: transactions.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    };
  });

  const schemes = await Promise.all(schemePromises);

  return {
    investor,
    statements,
    schemes,
  };
}

interface HistoricalData {
  units: number;
  investedAmount: number;
}

function calculateXIRR(
  transactions: Transaction[],
  marketValue: number,
  valuationDate: Date
): number {
  const cashFlows: { amount: number; when: Date }[] = transactions
    .map((tx) => {
      if (investmentTypes.includes(tx.type)) {
        return {
          amount: -Math.abs(tx.amount), // Negative for investments
          when: parseYYYYMMDDString(tx.date),
        };
      } else if (withdrawTypes.includes(tx.type)) {
        return {
          amount: tx.amount, // Positive for withdrawals
          when: parseYYYYMMDDString(tx.date),
        };
      }
      return null;
    })
    .filter((cf): cf is { amount: number; when: Date } => cf !== null);

  // Add current market value as the final cash flow if there are any units
  if (marketValue > 0) {
    cashFlows.push({
      amount: marketValue,
      when: valuationDate,
    });
  }

  if (cashFlows.length < 2) {
    return 0; // Not enough data points for XIRR
  }

  try {
    // The xirr library requires at least one positive and one negative cash flow.
    const hasPositive = cashFlows.some((cf) => cf.amount > 0);
    const hasNegative = cashFlows.some((cf) => cf.amount < 0);

    if (!hasPositive || !hasNegative) {
      return 0;
    }

    const result = xirr(cashFlows);
    return result * 100; // Return as a percentage
  } catch (e) {
    // It's common for XIRR to fail to converge, especially with unusual cash flows.
    // console.error(`Could not calculate XIRR: ${e}`);
    return 0;
  }
}

function calculatePortfolioXIRR(
  portfolio: Portfolio,
  marketValue: number,
  date: Date
): number {
  const transactions = portfolio.schemes.flatMap((sc) => sc.transactions);
  const filteredTransactions = removedReversalTransactions(transactions);
  return calculateXIRR(filteredTransactions, marketValue, date);
}

export async function getPortfolio(): Promise<PortfolioView> {
  return processPortfolio('OHo9Mhp3K63nZrs6arMMizh0tXe3');
}

export async function getLastNDaysPortfolio(
  days: number
): Promise<PortfolioView[]> {
  if (!mostRecentNavDate) {
    await processPortfolio('OHo9Mhp3K63nZrs6arMMizh0tXe3'); // Ensure mostRecentNavDate is set
  }

  const promises: Promise<PortfolioView>[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const targetDate = new Date(mostRecentNavDate!);
    targetDate.setDate(targetDate.getDate() - i);
    promises.push(processPortfolio('OHo9Mhp3K63nZrs6arMMizh0tXe3', targetDate));
  }

  const results = await Promise.all(promises);
  return results;
}

export async function getPortfolioForLastYearByMonth(): Promise<
  PortfolioView[]
> {
  if (!mostRecentNavDate) {
    await processPortfolio('OHo9Mhp3K63nZrs6arMMizh0tXe3'); // Ensure mostRecentNavDate is set
  }

  const promises: Promise<PortfolioView>[] = [];
  const today = new Date(mostRecentNavDate!);

  for (let i = 0; i < 12; i++) {
    const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
    promises.push(processPortfolio('OHo9Mhp3K63nZrs6arMMizh0tXe3', targetDate));
  }

  const results = await Promise.all(promises);
  return results.sort(
    (a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime()
  ); // sort ascending
}

export async function getLast30DaysPortfolio(): Promise<PortfolioView[]> {
  return getLastNDaysPortfolio(30);
}

export async function processPortfolio(
  userId: string,
  date?: Date
): Promise<PortfolioView> {
  const portfolioData = await getPortfolioFromFirestore(userId);
  if (!portfolioData) {
    throw new Error('portfolio doesnt exist');
  }

  const { investor, statements, schemes } = portfolioData;

  const mutualFunds = await processSchemes(schemes, date);

  const totalInvested = mutualFunds.reduce(
    (acc, mf) => acc + mf.investedAmount,
    0
  );
  const totalMarketValue = mutualFunds.reduce(
    (acc, mf) => acc + (mf.marketValue ?? 0),
    0
  );
  const totalAbsoluteGain = mutualFunds.reduce(
    (acc, mf) => acc + (mf.absoluteGainLoss ?? 0),
    0
  );
  const totalRealizedGain = mutualFunds.reduce(
    (acc, mf) => acc + (mf.realizedGainLoss ?? 0),
    0
  );
  const totalGainLossPercentage =
    totalInvested > 0 ? (totalAbsoluteGain / totalInvested) * 100 : 0;

  let portfolioDate = mostRecentNavDate;
  if (date) {
    portfolioDate = date;
  }

  const portfolioView: PortfolioView = {
    investor: {
      address: investor.address,
      email: investor.email,
      mobile: investor.mobile,
      name: investor.name,
      pan: investor.pan,
    },
    statementPeriods: statements.map((s) => s.period),
    investedValue: totalInvested,
    marketValue: totalMarketValue,
    absoluteGainLoss: totalAbsoluteGain,
    absoluteGainLossPercentage: totalGainLossPercentage,
    realizedGainLoss: totalRealizedGain,
    mutualFunds: mutualFunds,
    date: portfolioDate ? formatDateToYYYYMMDD(portfolioDate) : '',
  };

  portfolioView.xirrGainLoss = calculatePortfolioXIRR(
    portfolioData!,
    totalMarketValue,
    portfolioDate!
  );
  return portfolioView;
}

async function processSchemes(
  schemes: Scheme[],
  date?: Date
): Promise<MutualFundView[]> {
  const processedSchemePromises = schemes.map((scheme) =>
    processScheme(scheme, date)
  );
  const allProcessedSchemes = await Promise.all(processedSchemePromises);

  const fundsMap: Map<
    string,
    { amc: string; folioNumbers: Set<string>; schemes: SchemeView[] }
  > = new Map();

  allProcessedSchemes.forEach((s) => {
    if (!fundsMap.has(s.amc)) {
      fundsMap.set(s.amc, {
        amc: s.amc,
        folioNumbers: new Set<string>(),
        schemes: [],
      });
    }
    fundsMap.get(s.amc)!.schemes.push(s);
    fundsMap.get(s.amc)!.folioNumbers.add(s.folioNumber);
  });

  const mutualFundViews: MutualFundView[] = [];
  for (const [key, fundGroup] of fundsMap.entries()) {
    const investedAmount = fundGroup.schemes.reduce(
      (acc, s) => acc + (s.units! > 0 ? (s.investedAmount ?? 0) : 0),
      0
    );
    const marketValue = fundGroup.schemes.reduce(
      (acc, s) => acc + (s.units! > 0 ? (s.marketValue ?? 0) : 0),
      0
    );
    const absoluteGainLoss = fundGroup.schemes.reduce(
      (acc, s) => acc + (s.units! > 0 ? (s.absoluteGainLoss ?? 0) : 0),
      0
    );
    const realizedGainLoss = fundGroup.schemes.reduce(
      (acc, s) => acc + (s.realizedGainLoss ?? 0),
      0
    );
    const gainLossPercentage =
      investedAmount > 0 ? (absoluteGainLoss / investedAmount) * 100 : 0;

    mutualFundViews.push({
      name: fundGroup.amc,
      folioNumbers: [...fundGroup.folioNumbers.keys()],
      investedAmount,
      marketValue,
      absoluteGainLoss,
      realizedGainLoss,
      absoluteGainLossPercentage: gainLossPercentage,
      schemes: fundGroup.schemes,
    });
  }
  return mutualFundViews;
}

export async function processScheme(
  scheme: Scheme,
  reqDate?: Date
): Promise<SchemeView> {
  const filteredTransactions = removedReversalTransactions(scheme.transactions);
  const filteredTransactionByDate = reqDate
    ? filteredTransactions.filter((t) => parseYYYYMMDDString(t.date) <= reqDate)
    : filteredTransactions;

  updateScheme(scheme, filteredTransactionByDate);
  const navByDate = await processNAVDate(scheme.amfi, scheme.isin, reqDate);
  const nav = Number(navByDate.nav);
  const date = navByDate.date;
  const marketValue = scheme.units * nav;
  const gainLoss = marketValue - scheme.investedAmount;
  const gainLossPercentage = (gainLoss / scheme.investedAmount) * 100;
  const valuationDate = reqDate ? reqDate : mostRecentNavDate!;
  const xirrValue = calculateXIRR(
    filteredTransactionByDate,
    marketValue,
    valuationDate
  );
  const res: SchemeView = {
    id: scheme.id,
    name: scheme.name,
    amc: scheme.amc,
    amfi: scheme.amfi,
    isin: scheme.isin,
    units: scheme.units,
    investedAmount: scheme.investedAmount,
    marketValue: marketValue,
    absoluteGainLoss: gainLoss,
    absoluteGainLossPercentage: gainLossPercentage,
    nav: nav,
    date: date,
    realizedGainLoss: scheme.realizedGainLoss,
    xirrGainLoss: xirrValue,
    withdrawAmount: scheme.withdrawAmount,
    folioNumber: scheme.folioNumber,
  };
  return res;
}

export async function processNAVDate(
  amfiCode: string,
  isin: string,
  date?: Date
): Promise<SchemeNav> {
  if (!amfiCode) {
    amfiCode = (await getAmficCodeByIsin(isin)).toString();
  }
  if (date) {
    const navs = await getHistoricalNavBySchemeId(amfiCode);
    const requestedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    for (const nav of navs) {
      const navDate = parseDDMMYYYYString(nav.date);
      if (navDate.getTime() === requestedDate.getTime()) {
        return nav;
      }
      if (navDate < requestedDate) {
        return nav;
      }
    }
  } else {
    const latestNav = await getLatestNavBySchemeId(amfiCode);
    const navDate = parseDDMMYYYYString(latestNav.date); // Use the helper
    if (!mostRecentNavDate || navDate > mostRecentNavDate) {
      mostRecentNavDate = navDate;
    }
    return latestNav;
  }
  throw new Error('NAV not found for given date');
}

export async function getTransactionsByScemeId(
  schemeId: string
): Promise<TransactionView[]> {
  let userId = 'OHo9Mhp3K63nZrs6arMMizh0tXe3';
  try {
    const transactionsRef = firestore
      .collection('users')
      .doc(userId)
      .collection('schemes')
      .doc(schemeId)
      .collection('transactions');

    const snapshot = await transactionsRef.get();

    if (snapshot.empty) {
      return [];
    }

    const transactions = snapshot.docs.map((doc) => doc.data() as Transaction);

    return toTransactionViews(transactions);
  } catch (error) {
    console.error(`Error fetching transactions for scheme ${schemeId}:`, error);
    return [];
  }
}

export function toTransactionViews(
  transactions: Transaction[]
): TransactionView[] {
  let transactionViews: TransactionView[] = [];
  for (const t of transactions) {
    let transactionView: TransactionView = {
      id: t.id,
      date: t.date,
      schemeId: t.schemeId,
      description: t.description,
      type: t.type,
      nav: t.nav,
      units: t.units,
      stampDuty: t.stampDuty,
      sttTax: t.sttTax,
      capitalGainTax: t.capitalGainTax,
      actualInvestment: t.amount,
    };
    if (investmentTypes.includes(t.type)) {
      transactionView.investedAmount = t.amount + (t.stampDuty ?? 0);
    } else {
      transactionView.withdrawAmount = t.amount;
    }
    transactionViews.push(transactionView);
  }
  return transactionViews.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

function removedReversalTransactions(
  transactions: Transaction[]
): Transaction[] {
  const reversals = transactions.filter(
    (tx) => tx.type === TransactionType.REVERSAL
  );
  const otherTxs = transactions.filter(
    (tx) => tx.type !== TransactionType.REVERSAL
  );

  if (reversals.length === 0) {
    return transactions; // No reversals, no change needed
  }

  const investmentIdsToCancel = new Set<string>();
  const searchableTxs = [...otherTxs]; // A mutable copy for searching

  for (const reversal of reversals) {
    const matchIndex = searchableTxs.findIndex(
      (tx) =>
        investmentTypes.includes(tx.type) &&
        tx.date === reversal.date &&
        tx.amount === reversal.amount
    );

    if (matchIndex !== -1) {
      // Found the original transaction to cancel
      const matchedTx = searchableTxs[matchIndex];
      investmentIdsToCancel.add(matchedTx.id);

      // Remove it from our searchable list so it can't be matched again
      searchableTxs.splice(matchIndex, 1);
    }
  }

  // Filter the original non-reversal list
  return otherTxs.filter((tx) => !investmentIdsToCancel.has(tx.id));
}

function updateScheme(scheme: Scheme, transactions: Transaction[]) {
  let unitsHeld = 0;
  let totalCost = 0;
  let realizedGainLoss = 0;
  let stampDuty = 0;
  let sttTax = 0;
  let capitalGainTax = 0;

  let withdrawAmount: number = transactions // Declared withdrawAmount
    .filter((tx) => withdrawTypes.includes(tx.type))
    .reduce((sum, tx) => sum + tx.amount, 0); // Assuming tx.amount is correct for withdrawal
  if (scheme.isClosed) {
    totalCost = scheme.investedAmount;
    realizedGainLoss = withdrawAmount - scheme.investedAmount;
  } else {
    const purchases = transactions
      .filter((t) => investmentTypes.includes(t.type) && t.units > 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((p) => {
        return {
          ...p,
          remainingUnits: p.units,
        };
      });
    totalCost = purchases.reduce((sum, tx) => sum + tx.amount, 0);
    unitsHeld = purchases.reduce((sum, tx) => sum + tx.units, 0);
    stampDuty = purchases.reduce((sum, tx) => sum + (tx.stampDuty ?? 0), 0);

    const sales = transactions
      .filter((t) => withdrawTypes.includes(t.type))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sttTax = sales.reduce((sum, tx) => sum + (tx.sttTax ?? 0), 0);
    capitalGainTax = sales.reduce(
      (sum, tx) => sum + (tx.capitalGainTax ?? 0),
      0
    );

    for (const sale of sales) {
      let unitsToSell = Math.abs(sale.units);
      const salePricePerUnit = sale.nav;
      for (const purchase of purchases) {
        if (unitsToSell === 0) break;
        if (purchase.remainingUnits! > 0) {
          const unitsToProcess = Math.min(
            unitsToSell,
            purchase.remainingUnits!
          );
          unitsHeld -= unitsToProcess;
          totalCost -= unitsToProcess * purchase.nav;
          realizedGainLoss +=
            unitsToProcess * (salePricePerUnit - purchase.nav);
          purchase.remainingUnits! -= unitsToProcess;
          unitsToSell -= unitsToProcess;
        } else {
          purchases.shift();
        }
      }
    }
  }

  scheme.units = unitsHeld;
  scheme.investedAmount = totalCost;
  scheme.realizedGainLoss = realizedGainLoss;
  scheme.withdrawAmount = withdrawAmount;
  scheme.capitalGainTax = capitalGainTax;
  scheme.stampDuty = stampDuty;
  scheme.sttTax = sttTax;
}
