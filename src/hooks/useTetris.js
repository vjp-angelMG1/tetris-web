import { useState, useEffect, useCallback } from 'react';

const ANCHO = 10;
const ALTO = 20;

const TETROMINOS = { 
  I: { shape: [[1, 1, 1, 1]], color: '#22d3ee' },
  O: { shape: [[1, 1], [1, 1]], color: '#facc15' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#a855f7' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#4ade80' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#f87171' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#3b82f6' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#fb923c' },
};

const crearTableroVacio = () => Array.from(Array(ALTO), () => new Array(ANCHO).fill(0));
const piezaAleatoria = () => TETROMINOS[Object.keys(TETROMINOS)[Math.floor(Math.random() * Object.keys(TETROMINOS).length)]];

export const useTetris = () => {
  const [tablero, setTablero] = useState(crearTableroVacio());
  const [posPieza, setPosPieza] = useState({ x: 3, y: 0 });
  const [pieza, setPieza] = useState(piezaAleatoria());
  const [gameOver, setGameOver] = useState(false);
  const [puntuacion, setPuntuacion] = useState(0);

  const comprobarColision = useCallback((nuevaPieza, nuevaPos) => {
    for (let y = 0; y < nuevaPieza.shape.length; y++) {
      for (let x = 0; x < nuevaPieza.shape[y].length; x++) {
        if (nuevaPieza.shape[y][x] !== 0) {
          const boardX = nuevaPos.x + x;
          const boardY = nuevaPos.y + y;
          if (boardX < 0 || boardX >= ANCHO || boardY >= ALTO) return true;
          if (boardY >= 0 && tablero[boardY][boardX] !== 0) return true;
        }
      }
    }
    return false;
  }, [tablero]);

  const fijarPieza = useCallback(() => {
    const nuevoTablero = tablero.map(row => [...row]);
    pieza.shape.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val !== 0 && y + posPieza.y >= 0) nuevoTablero[y + posPieza.y][x + posPieza.x] = pieza.color;
      });
    });

    let lineasBorradas = 0;
    const tableroFinal = nuevoTablero.reduce((acc, row) => {
      if (row.every(cell => cell !== 0)) {
        lineasBorradas++;
        acc.unshift(new Array(ANCHO).fill(0));
      } else acc.push(row);
      return acc;
    }, []);

    setPuntuacion(prev => prev + (lineasBorradas * 100));
    setTablero(tableroFinal);
    
    const nuevaPieza = piezaAleatoria();
    const nuevaPos = { x: 3, y: 0 };
    if (comprobarColision(nuevaPieza, nuevaPos)) setGameOver(true);
    else { setPieza(nuevaPieza); setPosPieza(nuevaPos); }
  }, [tablero, pieza, posPieza, comprobarColision]);

  const moverPieza = useCallback((dx, dy) => {
    if (gameOver) return;
    const nuevaPos = { x: posPieza.x + dx, y: posPieza.y + dy };
    if (!comprobarColision(pieza, nuevaPos)) setPosPieza(nuevaPos);
    else if (dy > 0) fijarPieza();
  }, [gameOver, posPieza, pieza, comprobarColision, fijarPieza]);

  const rotarPieza = useCallback(() => {
    if (gameOver) return;
    const rotada = { ...pieza, shape: pieza.shape[0].map((_, i) => pieza.shape.map(row => row[i]).reverse()) };
    if (!comprobarColision(rotada, posPieza)) setPieza(rotada);
  }, [gameOver, pieza, posPieza, comprobarColision]);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => moverPieza(0, 1), 800);
    return () => clearInterval(interval);
  }, [moverPieza, gameOver]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver) return;
      if (e.key === 'ArrowLeft') moverPieza(-1, 0);
      else if (e.key === 'ArrowRight') moverPieza(1, 0);
      else if (e.key === 'ArrowDown') moverPieza(0, 1);
      else if (e.key === 'ArrowUp') rotarPieza();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moverPieza, rotarPieza, gameOver]);

  const reiniciarJuego = () => {
    setTablero(crearTableroVacio());
    setPosPieza({ x: 3, y: 0 });
    setPieza(piezaAleatoria());
    setGameOver(false);
    setPuntuacion(0);
  };

  const tableroVisual = tablero.map(row => [...row]);
  if (!gameOver) {
    pieza.shape.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val !== 0 && y + posPieza.y >= 0) tableroVisual[y + posPieza.y][x + posPieza.x] = pieza.color;
      });
    });
  }

  return { tableroVisual, puntuacion, gameOver, reiniciarJuego };
};