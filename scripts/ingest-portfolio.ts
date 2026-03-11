// scripts/ingest-portfolio.ts
import { firestore, bucket } from '@/lib/firebase';
import { Scheme, SchemeNavStatus, SchemeType } from '@/features/schemes/type';
import {
  Transaction,
  TransactionType,
  investmentTypes,
  withdrawTypes,
} from '@/features/transactions/type';
import { Investor, Statement, Portfolio } from '@/features/portfolio/type';
import { getAllSchemeData } from '@/lib/clients/scheme';
import { parseYYYYMMDDString } from '@/lib/utils/date';

// --- Main script execution ---

const USER_ID = 'Tjf5pyfIoe0AJGNfYEnFwwFAvKSq';

export interface PortfolioDTO {
  demat_accounts: DematAccountDTO[];
  insurance: InsuranceDTO;
  investor: InvestorDTO;
  meta: MetaDTO;
  mutual_funds: MutualFundDTO[];
}

export interface InvestorDTO {
  address: string;
  cas_id: string | null;
  email: string;
  mobile: string;
  name: string;
  pan: string | null;
  pincode: string | null;
}

interface StatementPeriodDTO {
  from: string;
  to: string;
}

interface MetaDTO {
  cas_type: string;
  generated_at: string;
  statement_period: StatementPeriodDTO;
}

interface DematAccountDTO {
  // Define properties for DematAccount if any
}

interface LifeInsurancePolicyDTO {
  // Define properties for LifeInsurancePolicy if any
}

interface InsuranceDTO {
  life_insurance_policies: LifeInsurancePolicyDTO[];
}

interface MutualFundInfoDTO {
  kyc: string;
  name: string;
  pan: string;
  pankyc: string;
}

interface LinkedHolderDTO {
  name: string;
  pan: string;
}

export interface MutualFundDTO {
  additional_info: MutualFundInfoDTO;
  amc: string;
  folio_number: string;
  linked_holders: LinkedHolderDTO[];
  registrar: string;
  schemes: SchemeDTO[];
}

export interface TransactionDTO {
  amount: number;
  balance: number | null;
  date: string;
  description: string;
  dividend_rate: number | null;
  nav: number | null;
  type: TransactionType;
  units: number | null;
}

interface GainDTO {
  absolute: number;
  percentage: number;
}

export interface SchemeDTO {
  additional_info: SchemeAdditionalInfoDTO;
  cost: number;
  gain: GainDTO;
  isin: string;
  name: string;
  nav: number;
  nominees: string[];
  transactions: TransactionDTO[];
  type: SchemeType;
  units: number;
  value: number;
}

interface SchemeAdditionalInfoDTO {
  advisor: string;
  amfi: string;
  close_units: number;
  open_units: number;
  rta: string;
  rta_code: string;
}

async function ingestPortfolioData(
  portfolioData: PortfolioDTO,
  userId: string
) {
  console.log('Ingesting data for user:', userId);
  const portfolio = await processPortfolio(portfolioData);
  const lastesNavDate = new Date(portfolioData.meta.generated_at);
  const schemes = await processSchemes(
    lastesNavDate,
    portfolioData.mutual_funds
  );

  const batch = firestore.batch();

  const userRef = firestore.collection('users').doc(userId);

  const investorData: Partial<Investor> = portfolio.investor;
  batch.set(
    userRef,
    { ...investorData, updatedAt: new Date() },
    { merge: true }
  );
  const statemnet: Partial<Statement> = portfolio.statements[0];

  const statementRef = firestore
    .collection('users')
    .doc(userId)
    .collection('statements')
    .doc(
      `${portfolio.statements[0].period.from}-${portfolio.statements[0].period.to}`
    );
  batch.set(statementRef, statemnet, { merge: true });

  for (const s of schemes) {
    const schemeId = s.id;
    if (!schemeId) {
      console.warn(
        'Scheme found with no transactions or schemeId, skipping:',
        s.name
      );
      continue;
    }

    const schemeRef = firestore
      .collection('users')
      .doc(userId)
      .collection('schemes')
      .doc(schemeId);

    // Omit 'transactions' from the main scheme document
    const { transactions, ...schemeToSave } = s;
    batch.set(schemeRef, schemeToSave, { merge: true });

    // Add each transaction to a 'transactions' subcollection
    for (const transaction of transactions) {
      const transactionRef = schemeRef
        .collection('transactions')
        .doc(transaction.id);
      batch.set(transactionRef, transaction);
    }
  }

  await batch.commit();
}

async function processPortfolio(portfolio: PortfolioDTO): Promise<Portfolio> {
  let schemes: Scheme[] = [];
  const investor: Investor = {
    address: portfolio.investor.address,
    email: portfolio.investor.email,
    mobile: portfolio.investor.mobile,
    name: portfolio.investor.name,
    pan: portfolio.investor.pan ?? '',
  };
  let pf: Portfolio = {
    investor: investor,
    statements: [
      {
        period: {
          from: portfolio.meta.statement_period.from,
          to: portfolio.meta.statement_period.to,
        },
      },
    ],
  };
  return pf;
}

async function processSchemes(
  latestNavDate: Date,
  mutualFunds: MutualFundDTO[]
): Promise<Scheme[]> {
  const schemes: Scheme[] = [];
  for (const mf of mutualFunds) {
    for (const s of mf.schemes) {
      const { schemeId, amfi } = await getSchemeIdAndAmfi(mf, s);
      const transactions = processTransactions(s.transactions, schemeId);
      const isClosed = s.units === 0;
      const scheme: Scheme = {
        id: schemeId,
        name: s.name,
        amfi: amfi,
        amc: mf.amc,
        isin: s.isin,
        folioNumber: mf.folio_number,
        units: s.units,
        investedAmount: s.cost,
        isClosed: isClosed,
        marketValue: s.value,
        navStatus: SchemeNavStatus.Pending,
        type: s.type,
        transactions: transactions,
        nav: s.nav,
        latestNavDate: latestNavDate,
      };
      schemes.push(scheme);
    }
  }

  return schemes;
}

function processInvestment(
  currentTx: TransactionDTO,
  allTxs: TransactionDTO[],
  currentIndex: number,
  transaction: Transaction
): number {
  let nextIndex = currentIndex + 1;
  while (nextIndex < allTxs.length) {
    const nextTx = allTxs[nextIndex];
    if (
      nextTx.date === currentTx.date &&
      nextTx.type === TransactionType.StampDutyTax
    ) {
      transaction.stampDuty = nextTx.amount;
      nextIndex++;
    } else {
      break;
    }
  }
  return nextIndex;
}

function processWithdrawal(
  currentTx: TransactionDTO,
  allTxs: TransactionDTO[],
  currentIndex: number,
  transaction: Transaction
): number {
  let nextIndex = currentIndex + 1;
  while (nextIndex < allTxs.length) {
    const nextTx = allTxs[nextIndex];
    if (
      nextTx.date === currentTx.date &&
      nextTx.type === TransactionType.SttTax
    ) {
      transaction.sttTax = nextTx.amount;
      nextIndex++;
    } else if (
      nextTx.date === currentTx.date &&
      nextTx.type === TransactionType.TdsTax
    ) {
      transaction.capitalGainTax = nextTx.amount;
      nextIndex++;
    } else if (
      nextTx.date === currentTx.date &&
      nextTx.type === TransactionType.StampDutyTax
    ) {
      transaction.stampDuty = nextTx.amount;
      nextIndex++;
    } else {
      break;
    }
  }
  return nextIndex;
}

function processTransactions(
  transactionDTOs: TransactionDTO[],
  schemeId: string
): Transaction[] {
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
    } else if (
      withdrawTypes.includes(currentTxDto.type) ||
      currentTxDto.type == TransactionType.REVERSAL
    ) {
      i = processWithdrawal(currentTxDto, transactionDTOs, i, transaction);
    } else {
      i++;
    }
    transactions.push(transaction);
  }

  return transactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

async function getSchemeIdAndAmfi(
  mutualFund: MutualFundDTO,
  scheme: SchemeDTO
) {
  let amfi = scheme.additional_info?.amfi;

  if (!amfi) {
    const allSchemes = await getAllSchemeData();
    const matchingScheme = allSchemes.find(
      (s) =>
        s.isinDivPayoutOrGrowth === scheme.isin ||
        s.isinDivReinvestment === scheme.isin
    );
    if (matchingScheme) {
      amfi = matchingScheme.code;
    }
  }

  const sanitizedAmfi = (amfi ?? '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const sanitizedFolio = mutualFund.folio_number.replace(/\//g, '');
  const sanitizedAmc = mutualFund.amc
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
  const schemeId = `${sanitizedAmc}-${sanitizedFolio}-${sanitizedAmfi}`;
  return { schemeId, amfi: amfi ?? '' };
}

function mapTransaction(
  dto: TransactionDTO,
  schemeId: string,
  index: number
): Transaction {
  return {
    id: `${schemeId}-${dto.date}-${index}`,
    schemeId,
    date: parseYYYYMMDDString(dto.date),
    description: dto.description,
    type: dto.type,
    nav: dto.nav || 0,
    units: Math.abs(dto.units || 0),
    amount: Math.abs(dto.amount),
  };
}

async function main() {
  console.log('Starting portfolio data ingestion...');

  const fileName = 'VIMIT_PORTFOLIO.json';
  let fileContent;

  try {
    console.log(
      `Downloading portfolio file '${fileName}' from storage bucket...`
    );
    const file = bucket.file(fileName);
    const [downloadedContent] = await file.download();
    fileContent = downloadedContent.toString('utf-8');
    console.log('File downloaded successfully.');
  } catch (error) {
    console.error(
      `Failed to download '${fileName}' from Firebase Storage.`,
      error
    );
    process.exit(1);
  }

  const portfolioData: PortfolioDTO = JSON.parse(fileContent);

  // Call the ingestion function which is now local to this script
  await ingestPortfolioData(portfolioData, USER_ID);

  console.log('Portfolio data ingestion finished.');
}

main().catch((error) => {
  console.error('An error occurred during portfolio data ingestion:', error);
  process.exit(1);
});
