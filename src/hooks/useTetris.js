import { useState, useEffect, useCallback, useRef } from 'react';

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

export const useTetris = (difficulty = 'medium') => {
  const [tablero, setTablero] = useState(crearTableroVacio());
  const [posPieza, setPosPieza] = useState({ x: 3, y: 0 });
  const [pieza, setPieza] = useState(piezaAleatoria());
  const [siguientePieza, setSiguientePieza] = useState(piezaAleatoria());
  const [gameOver, setGameOver] = useState(false);
  const [puntuacion, setPuntuacion] = useState(0);
  const [pausado, setPausado] = useState(false);

  const speeds = { easy: 1000, medium: 700, hard: 350 };
  const baseSpeed = speeds[difficulty] || speeds.medium;
  const currentSpeed = Math.max(100, baseSpeed - (puntuacion * 1.5));

  const tableroRef = useRef(tablero);
  const piezaRef = useRef(pieza);
  const posPiezaRef = useRef(posPieza);
  const siguientePiezaRef = useRef(siguientePieza);
  const gameOverRef = useRef(gameOver);
  const pausadoRef = useRef(pausado);

  useEffect(() => { tableroRef.current = tablero; }, [tablero]);
  useEffect(() => { piezaRef.current = pieza; }, [pieza]);
  useEffect(() => { posPiezaRef.current = posPieza; }, [posPieza]);
  useEffect(() => { siguientePiezaRef.current = siguientePieza; }, [siguientePieza]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);
  useEffect(() => { pausadoRef.current = pausado; }, [pausado]);

  const comprobarColision = useCallback((nuevaPieza, nuevaPos, tableroActual) => {
    for (let y = 0; y < nuevaPieza.shape.length; y++) {
      for (let x = 0; x < nuevaPieza.shape[y].length; x++) {
        if (nuevaPieza.shape[y][x] !== 0) {
          const boardX = nuevaPos.x + x;
          const boardY = nuevaPos.y + y;
          if (boardX < 0 || boardX >= ANCHO || boardY >= ALTO) return true;
          if (boardY >= 0 && tableroActual[boardY][boardX] !== 0) return true;
        }
      }
    }
    return false;
  }, []);

  const fijarPieza = useCallback(() => {
    const nuevoTablero = tableroRef.current.map(row => [...row]);
    piezaRef.current.shape.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val !== 0 && y + posPiezaRef.current.y >= 0) 
          nuevoTablero[y + posPiezaRef.current.y][x + posPiezaRef.current.x] = piezaRef.current.color;
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
    
    const sigPieza = siguientePiezaRef.current;
    const nuevaPos = { x: 3, y: 0 };
    
    if (comprobarColision(sigPieza, nuevaPos, tableroFinal)) {
      setGameOver(true);
    } else {
      setPieza(sigPieza);
      setPosPieza(nuevaPos);
      setSiguientePieza(piezaAleatoria());
    }
  }, [comprobarColision]);

  const moverPieza = useCallback((dx, dy) => {
    if (gameOverRef.current || pausadoRef.current) return;
    const nuevaPos = { x: posPiezaRef.current.x + dx, y: posPiezaRef.current.y + dy };
    if (!comprobarColision(piezaRef.current, nuevaPos, tableroRef.current)) {
      setPosPieza(nuevaPos);
    } else if (dy > 0) {
      fijarPieza();
    }
  }, [comprobarColision, fijarPieza]);

  const rotarPieza = useCallback(() => {
    if (gameOverRef.current || pausadoRef.current) return;
    const rotada = { ...piezaRef.current, shape: piezaRef.current.shape[0].map((_, i) => piezaRef.current.shape.map(row => row[i]).reverse()) };
    if (!comprobarColision(rotada, posPiezaRef.current, tableroRef.current)) setPieza(rotada);
  }, [comprobarColision]);

  useEffect(() => {
    if (gameOver || pausado) return;
    const interval = setInterval(() => moverPieza(0, 1), currentSpeed);
    return () => clearInterval(interval);
  }, [moverPieza, gameOver, pausado, currentSpeed]); 

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameOver || pausado) return;
      if (e.key === 'ArrowLeft') moverPieza(-1, 0);
      else if (e.key === 'ArrowRight') moverPieza(1, 0);
      else if (e.key === 'ArrowDown') moverPieza(0, 1);
      else if (e.key === 'ArrowUp') rotarPieza();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moverPieza, rotarPieza, gameOver, pausado]);

  const togglePausa = () => {
    if (!gameOver) setPausado(prev => !prev);
  };

  const reiniciarJuego = () => {
    setTablero(crearTableroVacio());
    setPosPieza({ x: 3, y: 0 });
    setPieza(piezaAleatoria());
    setSiguientePieza(piezaAleatoria());
    setGameOver(false);
    setPuntuacion(0);
    setPausado(false);
  };

  const tableroVisual = tablero.map(row => [...row]);
  if (!gameOver) {
    pieza.shape.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val !== 0 && y + posPieza.y >= 0) tableroVisual[y + posPieza.y][x + posPieza.x] = pieza.color;
      });
    });
  }

  return { tableroVisual, puntuacion, gameOver, reiniciarJuego, moverPieza, rotarPieza, siguientePieza, pausado, togglePausa };
};