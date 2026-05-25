import { db } from "../../config/firebase";
import { collection, getDocs, addDoc, query, orderBy, limit, startAfter } from "firebase/firestore";

/**
 * Servicio para gestionar las operaciones CRUD de los rankings en Firestore.
 */
const RankingService = {
  /**
   * Obtiene una página de puntuaciones de la base de datos.
   * @param {number} batchSize - Cantidad de elementos a cargar por página (por defecto 100).
   * @param {Object|null} lastDoc - El último documento de la página anterior (para paginación).
   * @returns {Promise<{rankings: Array, lastDoc: Object|null, hasMore: boolean}>} Resultado paginado.
   */
  getRanking: async (batchSize = 100, lastDoc = null) => {
    try {
      let q = query(collection(db, "rankings"), orderBy("score", "desc"), limit(batchSize));
      
      // Si existe un último documento, empezamos a buscar después de él
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const rankings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // El nuevo último documento para la próxima llamada
      const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
      
      // Si la cantidad de documentos devueltos es menor que el batchSize, significa que no hay más páginas
      const hasMore = querySnapshot.docs.length === batchSize;

      return { rankings, lastDoc: newLastDoc, hasMore };
    } catch (error) {
      console.error("Error obteniendo el ranking:", error);
      return { rankings: [], lastDoc: null, hasMore: false };
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