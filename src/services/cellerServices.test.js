import { applyUploadAndTriedOperations } from './cellerServices';

describe('applyUploadAndTriedOperations', () => {
  it('keeps tried history persistent while replacing current drinks', () => {
    const result = applyUploadAndTriedOperations([
      { type: 'upload', drinkIds: [1, 2, 3, 4, 5] },
      { type: 'markTried', drinkIds: [2, 4] },
      { type: 'upload', drinkIds: [1, 2, 3, 5, 6] },
      { type: 'markTried', drinkIds: [3] },
      { type: 'upload', drinkIds: [2, 3, 4, 5, 6] },
    ]);

    expect(result.currentDrinkIds).toEqual([2, 3, 4, 5, 6]);
    expect(result.triedInCurrent.sort((a, b) => a - b)).toEqual([2, 3, 4]);
    expect(result.persistentTriedDrinkIds.sort((a, b) => a - b)).toEqual([2, 3, 4]);
  });
});
