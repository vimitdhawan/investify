import { firestore } from '@/lib/firebase';
import { Goal } from './type';
import { getDocument, getSubCollection } from '@/lib/db';

export async function getGoals(userId: string): Promise<Goal[]> {
  return getSubCollection<Goal>('users', userId, 'goals');
}

export async function getGoal(
  userId: string,
  goalId: string
): Promise<Goal | null> {
  return getDocument<Goal>(`users/${userId}/goals`, goalId);
}

export async function createGoal(
  userId: string,
  goal: Omit<Goal, 'id'>
): Promise<string> {
  const docRef = await firestore
    .collection('users')
    .doc(userId)
    .collection('goals')
    .add(goal);

  // Update assigned schemes with the new goalId
  if (goal.schemeIds && goal.schemeIds.length > 0) {
    const batch = firestore.batch();
    goal.schemeIds.forEach((schemeId) => {
      const schemeRef = firestore
        .collection('users')
        .doc(userId)
        .collection('schemes')
        .doc(schemeId);
      batch.update(schemeRef, { goalId: docRef.id });
    });
    await batch.commit();
  }

  return docRef.id;
}

export async function updateGoal(
  userId: string,
  goalId: string,
  updates: Partial<Goal>
): Promise<void> {
  const goalRef = firestore
    .collection('users')
    .doc(userId)
    .collection('goals')
    .doc(goalId);

  // If schemeIds are updated, we need to handle unassigning old ones and assigning new ones
  if (updates.schemeIds) {
    const oldGoal = await getGoal(userId, goalId);
    if (oldGoal) {
      const oldSchemeIds = new Set(oldGoal.schemeIds);
      const newSchemeIds = new Set(updates.schemeIds);

      const batch = firestore.batch();

      // Schemes to remove
      oldGoal.schemeIds.forEach((schemeId) => {
        if (!newSchemeIds.has(schemeId)) {
          const schemeRef = firestore
            .collection('users')
            .doc(userId)
            .collection('schemes')
            .doc(schemeId);
          batch.update(schemeRef, { goalId: null });
        }
      });

      // Schemes to add
      updates.schemeIds.forEach((schemeId) => {
        if (!oldSchemeIds.has(schemeId)) {
          const schemeRef = firestore
            .collection('users')
            .doc(userId)
            .collection('schemes')
            .doc(schemeId);
          batch.update(schemeRef, { goalId: goalId });
        }
      });

      await batch.commit();
    }
  }

  await goalRef.update(updates);
}

export async function deleteGoal(
  userId: string,
  goalId: string
): Promise<void> {
  const goal = await getGoal(userId, goalId);
  if (!goal) return;

  const batch = firestore.batch();

  // Unassign schemes
  if (goal.schemeIds && goal.schemeIds.length > 0) {
    goal.schemeIds.forEach((schemeId) => {
      const schemeRef = firestore
        .collection('users')
        .doc(userId)
        .collection('schemes')
        .doc(schemeId);
      batch.update(schemeRef, { goalId: null });
    });
  }

  // Delete goal document
  const goalRef = firestore
    .collection('users')
    .doc(userId)
    .collection('goals')
    .doc(goalId);
  batch.delete(goalRef);

  await batch.commit();
}
