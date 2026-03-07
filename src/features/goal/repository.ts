import { firestore, admin } from '@/lib/firebase';
import { Goal } from '@/features/goal/type';
import { Scheme } from '@/features/schemes/type';
import { Transaction } from '@/features/transactions/type';
import {
  calculateXIRRForTransactions,
  projectCompletionDate,
} from '@/lib/utils/xirr-calculator';
import { toSchemeView } from '@/features/schemes/service';
import { getTransactionViews } from '@/features/transactions/service';

const GOALS_COLLECTION = 'goals';
const USERS_COLLECTION = 'users';
const SCHEMES_COLLECTION = 'schemes';

// Helper to calculate currentAmount and projectedDate for a goal
async function calculateGoalProjections(
  userId: string,
  goal: Goal
): Promise<{ currentAmount: number; projectedDate?: Date }> {
  let totalCurrentAmount = 0;
  let allTransactions: Transaction[] = [];
  let validSchemesForXIRR: Scheme[] = [];

  const schemesRef = firestore
    .collection(USERS_COLLECTION)
    .doc(userId)
    .collection(SCHEMES_COLLECTION);

  if (goal.schemeIds && goal.schemeIds.length > 0) {
    const schemePromises = goal.schemeIds.map(async (schemeId) => {
      const schemeDoc = await schemesRef.doc(schemeId).get();
      if (schemeDoc.exists) {
        return { id: schemeDoc.id, ...schemeDoc.data() } as Scheme;
      }
      return null;
    });

    const fetchedSchemes = (await Promise.all(schemePromises)).filter(
      (s): s is Scheme => s !== null
    );

    for (const scheme of fetchedSchemes) {
      const schemeTransactions = await getTransactionViews(userId, scheme.id);
      const processedScheme = await toSchemeView(scheme); // Use current date for processing
      if (processedScheme.xirrGainLoss && processedScheme.xirrGainLoss > 0) {
        totalCurrentAmount += processedScheme.marketValue ?? 0;
        // allTransactions = allTransactions.concat(
        //   schemeTransactions.map((txView) => ({
        //     id: txView.id,
        //     date: txView.date,
        //     schemeId: txView.schemeId,
        //     description: txView.description,
        //     type: txView.type,
        //     nav: txView.nav,
        //     units: txView.units,
        //     amount: txView.actualInvestment ?? 0,
        //     stampDuty: txView.stampDuty,
        //     sttTax: txView.sttTax,
        //     capitalGainTax: txView.capitalGainTax,
        //   }))
        // );
        validSchemesForXIRR.push(scheme);
      }
    }
  }

  let projectedDate: Date | undefined;
  if (
    validSchemesForXIRR.length > 0 &&
    totalCurrentAmount < goal.targetAmount
  ) {
    const combinedXIRR = calculateXIRRForTransactions(
      allTransactions,
      totalCurrentAmount,
      new Date() //  mostRecentNavDate || new Date(),
    );

    if (combinedXIRR > 0) {
      projectedDate =
        projectCompletionDate(
          totalCurrentAmount,
          goal.targetAmount,
          new Date(), //  mostRecentNavDate || new Date(),
          combinedXIRR
        ) || undefined;
    }
  } else if (totalCurrentAmount >= goal.targetAmount) {
    projectedDate = new Date(); //  mostRecentNavDate || new Date(),
  }

  return { currentAmount: totalCurrentAmount, projectedDate };
}

export async function createGoal(
  userId: string,
  goalData: Omit<Goal, 'id' | 'userId' | 'currentAmount' | 'projectedDate'>
): Promise<Goal> {
  const userRef = firestore.collection(USERS_COLLECTION).doc(userId);
  const goalsRef = userRef.collection(GOALS_COLLECTION);

  const newGoalRef = goalsRef.doc();
  let newGoal: Goal = {
    id: newGoalRef.id,
    userId: userId,
    ...goalData,
    currentAmount: 0, // Will be calculated
    projectedDate: undefined, // Will be calculated
  };

  const { currentAmount, projectedDate } = await calculateGoalProjections(
    userId,
    newGoal
  );
  newGoal.currentAmount = currentAmount;
  newGoal.projectedDate = projectedDate;

  await newGoalRef.set(newGoal);

  // Update associated schemes with the new goalId
  if (newGoal.schemeIds && newGoal.schemeIds.length > 0) {
    const batch = firestore.batch();
    for (const schemeId of newGoal.schemeIds) {
      const schemeRef = userRef.collection(SCHEMES_COLLECTION).doc(schemeId);
      batch.update(schemeRef, { goalId: newGoal.id });
    }
    await batch.commit();
  }

  return newGoal;
}

export async function getGoals(userId: string): Promise<Goal[]> {
  const userRef = firestore.collection(USERS_COLLECTION).doc(userId);
  const goalsRef = userRef.collection(GOALS_COLLECTION);
  const snapshot = await goalsRef.get();

  if (snapshot.empty) {
    return [];
  }

  const goals = snapshot.docs.map((doc) => doc.data() as Goal);

  // Recalculate projections for each goal to ensure current data
  const goalsWithProjections = await Promise.all(
    goals.map(async (goal) => {
      const { currentAmount, projectedDate } = await calculateGoalProjections(
        userId,
        goal
      );
      return { ...goal, currentAmount, projectedDate };
    })
  );

  return goalsWithProjections;
}

export async function getGoal(
  userId: string,
  goalId: string
): Promise<Goal | null> {
  const userRef = firestore.collection(USERS_COLLECTION).doc(userId);
  const goalRef = userRef.collection(GOALS_COLLECTION).doc(goalId);
  const doc = await goalRef.get();

  if (!doc.exists) {
    return null;
  }

  const goal = doc.data() as Goal;
  const { currentAmount, projectedDate } = await calculateGoalProjections(
    userId,
    goal
  );

  return { ...goal, currentAmount, projectedDate };
}

export async function updateGoal(
  userId: string,
  goalId: string,
  goalData: Partial<
    Omit<Goal, 'id' | 'userId' | 'currentAmount' | 'projectedDate'>
  >
): Promise<Goal | null> {
  const userRef = firestore.collection(USERS_COLLECTION).doc(userId);
  const goalRef = userRef.collection(GOALS_COLLECTION).doc(goalId);

  // Get current goal to handle schemeIds changes
  const currentGoalDoc = await goalRef.get();
  if (!currentGoalDoc.exists) {
    return null; // Goal not found
  }
  const currentGoal = currentGoalDoc.data() as Goal;

  await goalRef.update(goalData);

  // Handle schemeIds updates
  if (goalData.schemeIds !== undefined) {
    const oldSchemeIds = currentGoal.schemeIds || [];
    const newSchemeIds = goalData.schemeIds || [];

    const schemesToAdd = newSchemeIds.filter(
      (id) => !oldSchemeIds.includes(id)
    );
    const schemesToRemove = oldSchemeIds.filter(
      (id) => !newSchemeIds.includes(id)
    );

    const batch = firestore.batch();

    // Assign goalId to new schemes
    for (const schemeId of schemesToAdd) {
      const schemeRef = userRef.collection(SCHEMES_COLLECTION).doc(schemeId);
      batch.update(schemeRef, { goalId: goalId });
    }

    // Remove goalId from unassigned schemes
    for (const schemeId of schemesToRemove) {
      const schemeRef = userRef.collection(SCHEMES_COLLECTION).doc(schemeId);
      batch.update(schemeRef, { goalId: admin.firestore.FieldValue.delete() });
    }
    await batch.commit();
  }

  // Fetch the updated goal to run projections
  const updatedGoalDoc = await goalRef.get();
  if (!updatedGoalDoc.exists) {
    return null; // Should not happen
  }
  const updatedGoal = updatedGoalDoc.data() as Goal;

  const { currentAmount, projectedDate } = await calculateGoalProjections(
    userId,
    updatedGoal
  );

  // Update goal with new projections
  await goalRef.update({
    currentAmount: currentAmount,
    projectedDate: projectedDate,
  });

  return { ...updatedGoal, currentAmount, projectedDate };
}

export async function deleteGoal(
  userId: string,
  goalId: string
): Promise<void> {
  const userRef = firestore.collection(USERS_COLLECTION).doc(userId);
  const goalRef = userRef.collection(GOALS_COLLECTION).doc(goalId);

  // Get current goal to unlink schemes
  const currentGoalDoc = await goalRef.get();
  if (!currentGoalDoc.exists) {
    return; // Goal not found
  }
  const currentGoal = currentGoalDoc.data() as Goal;

  // Unlink associated schemes
  if (currentGoal.schemeIds && currentGoal.schemeIds.length > 0) {
    const batch = firestore.batch();
    for (const schemeId of currentGoal.schemeIds) {
      const schemeRef = userRef.collection(SCHEMES_COLLECTION).doc(schemeId);
      batch.update(schemeRef, { goalId: admin.firestore.FieldValue.delete() });
    }
    await batch.commit();
  }

  await goalRef.delete();
}
