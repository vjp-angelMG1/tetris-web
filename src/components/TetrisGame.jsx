import React from 'react';
import { useTetris } from '../hooks/useTetris';

const TetrisGame = ({ onGameOver }) => {
  const { tableroVisual, puntuacion, gameOver, reiniciarJuego } = useTetris();

  React.useEffect(() => {
    if (gameOver && onGameOver) {
      onGameOver(puntuacion);
    }
  }, [gameOver, puntuacion, onGameOver]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-2xl font-bold text-white">Puntuación: {puntuacion}</div>
      
      {/* Tablero reducido y adaptado para colores hexadecimales */}
      <div 
        className="grid bg-gray-900 border-2 border-gray-400 p-0.5 gap-px rounded"
        style={{ gridTemplateColumns: `repeat(10, 1rem)` }} // 1rem hace las celdas más pequeñas
      >
        {tableroVisual.map((row, y) => 
          row.map((cell, x) => (
            <div 
              key={`${y}-${x}`} 
              className="w-4 h-4 rounded-sm" // w-4 h-4 hace los cuadrados pequeños
              style={{ backgroundColor: cell || '#1f2937' }} // Pintamos con los códigos hex de tu hook (#1f2937 es el gris oscuro)
            />
          ))
        )}
      </div>

      {gameOver && (
        <div className="text-center text-red-500 font-bold text-xl animate-pulse">
          GAME OVER
          <br />
          <button 
            onClick={reiniciarJuego}
            className="mt-4 px-4 py-2 bg-white text-black rounded hover:bg-gray-300 text-sm"
          >
            Reiniciar
          </button>
        </div>
      )}
    </div>
  );
};

export default TetrisGame; 