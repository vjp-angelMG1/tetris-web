import { db } from "../../config/firebase";
import { collection, getDocs, addDoc, query, orderBy, limit } from "firebase/firestore";

/**
 * Servicio para gestionar las operaciones CRUD de los rankings en Firestore.
 */
const RankingService = {
  /**
   * Obtiene el Top 10 de puntuaciones de la base de datos.
   * @returns {Promise<Array<import('../../models/Score').Score>>} Array de puntuaciones ordenadas.
   */
  getTop10: async () => {
    try {
      const q = query(collection(db, "rankings"), orderBy("score", "desc"), limit(10));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error obteniendo el ranking:", error);
      return [];
    }
  },

  /**
   * Guarda una nueva puntuación.
   * @param {string} playerName 
   * @param {number} score 
   * @returns {Promise<void>}
   */
  saveScore: async (playerName, score) => {
    try {
      await addDoc(collection(db, "rankings"), {
        playerName: playerName,
        score: Number(score)
      });
    } catch (error) {
      console.error("Error guardando la puntuación:", error);
    }
  }
};

export default RankingService;