import { RankingService } from './index';
import { collection, getDocs, addDoc } from "firebase/firestore";

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(), getDocs: jest.fn(), addDoc: jest.fn(), query: jest.fn(), orderBy: jest.fn(), limit: jest.fn()
}));
jest.mock('../../config/firebase', () => ({ db: {} }));

describe('RankingService - Tests Unitarios', () => {
  it('1. getTop10 debería devolver puntuaciones ordenadas', async () => {
    const mockData = [
      { id: '1', data: () => ({ playerName: 'Alice', score: 500 }) },
      { id: '2', data: () => ({ playerName: 'Bob', score: 200 }) }
    ];
    getDocs.mockResolvedValueOnce({ docs: mockData });

    const result = await RankingService.getTop10();
    
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ id: '1', playerName: 'Alice', score: 500 });
  });

  it('2. saveScore debería llamar a addDoc con los datos correctos', async () => {
    addDoc.mockResolvedValueOnce({ id: 'newScore' });

    await RankingService.saveScore('Charlie', 1000);

    expect(addDoc).toHaveBeenCalledTimes(1);
    const dataSaved = addDoc.mock.calls[0][1];
    expect(dataSaved.playerName).toBe('Charlie');
    expect(dataSaved.score).toBe(1000);
  });
});