import { useEffect, useState, useRef } from 'react'
import './App.css'
import { useTetris } from './hooks/useTetris'
import { RankingService } from './services/data'

const backgrounds = [
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=80', 
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1920&q=80', 
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=80', 
  'https://images.unsplash.com/photo-1472214103451-9374bd1c749e?auto=format&fit=crop&w=1920&q=80', 
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1920&q=80'  
];

const MenuScreen = ({ onStartGame, onViewRanking }) => {
  const [difficulty, setDifficulty] = useState('medium')

  return (
    <div className="menu-screen">
      <div className="menu-card">
        <h1>Tetris <span>Web</span></h1>
        <p>Supervivencia y Naturaleza</p>

        <div className="menu-section">
          <h3>Selecciona Dificultad Inicial</h3>
          <div className="difficulty-selector">
            <button className={difficulty === 'easy' ? 'diff-active' : ''} onClick={() => setDifficulty('easy')}>Fácil</button>
            <button className={difficulty === 'medium' ? 'diff-active' : ''} onClick={() => setDifficulty('medium')}>Media</button>
            <button className={difficulty === 'hard' ? 'diff-active' : ''} onClick={() => setDifficulty('hard')}>Difícil</button>
          </div>
          <p className="hint-text">La velocidad aumentará progresivamente según tu puntuación.</p>
        </div>

        <button className="btn-primary" onClick={() => onStartGame(difficulty)}>🎮 Nuevo Juego</button>
        <button className="btn-secondary" onClick={onViewRanking}>🏆 Ver Ranking</button>
      </div>
      
      <footer className="footer">
        <div className="footer-links">
          <a href="#" target="_blank" rel="noopener noreferrer">Política de Privacidad</a>
          <span>•</span>
          <a href="#" target="_blank" rel="noopener noreferrer">Términos y Condiciones</a>
        </div>
        <p>© {new Date().getFullYear()} Hecho por <strong>Ángel Montero Gregorio</strong></p>
      </footer>
    </div>
  )
}

const GameScreen = ({ difficulty, onGoMenu }) => { 
  const { tableroVisual, puntuacion, gameOver, reiniciarJuego, moverPieza, rotarPieza, siguientePieza, pausado, togglePausa } = useTetris(difficulty)
  const [showModal, setShowModal] = useState(false)
  const [playerName, setPlayerName] = useState('Jugador')
  const [saving, setSaving] = useState(false)
  
  const [time, setTime] = useState(0)
  const timerRef = useRef(null)

  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    setIsTouchDevice(hasTouch);
  }, []);

  const touchStartRef = useRef({ x: 0, y: 0 });
  const lastTouchYRef = useRef(0);
  const lastDropTime = useRef(0);

  const handleTouchStart = (e) => {
    if (!isTouchDevice) return;
    e.preventDefault(); 
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    lastTouchYRef.current = touch.clientY;
  };

  const handleTouchMove = (e) => {
    if (!isTouchDevice || pausado) return;
    e.preventDefault();
    
    const now = Date.now();
    const touch = e.touches[0];
    const deltaY = touch.clientY - lastTouchYRef.current;

    if (deltaY > 15 && now - lastDropTime.current > 80) {
      moverPieza(0, 1);
      lastTouchYRef.current = touch.clientY;
      lastDropTime.current = now;
    }
  };

  const handleTouchEnd = (e) => {
    if (!isTouchDevice || pausado) return;
    e.preventDefault();
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    if (Math.abs(deltaX) < 25 && Math.abs(deltaY) < 25) {
      rotarPieza();
      return;
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      moverPieza(deltaX > 0 ? 1 : -1, 0);
    }
  };

  useEffect(() => {
    if (gameOver) {
      clearInterval(timerRef.current)
      setShowModal(true)
    } else {
      timerRef.current = setInterval(() => setTime(t => t + 1), 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [gameOver])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const [currentBg, setCurrentBg] = useState(backgrounds[0])
  useEffect(() => {
    const index = Math.min(Math.floor(puntuacion / 200), backgrounds.length - 1)
    setCurrentBg(backgrounds[index])
  }, [puntuacion])

  const handleSaveAndRestart = async () => {
    if (!playerName.trim()) return
    setSaving(true)
    await RankingService.saveScore(playerName.trim(), puntuacion)
    setSaving(false)
    setShowModal(false)
    reiniciarJuego()
    setTime(0)
  }

  const handlePlayAgain = () => {
    setShowModal(false)
    reiniciarJuego()
    setTime(0)
  }

  return (
    <div className="game-screen" style={{ backgroundImage: `url(${currentBg})` }}>
      <div className="game-overlay">
        
        {/* BARRA SUPERIOR */}
        <div className="game-top-bar">
          <button className="btn-back" onClick={onGoMenu}>← Menú</button>
          <div className="timer-display">⏱️ {formatTime(time)}</div>
          <div className="score-display">Score: <strong>{puntuacion}</strong></div>
          <div className="difficulty-badge">
            {difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Media' : 'Difícil'}
          </div>
        </div>

        {/* ZONA DE JUEGO: Panel Izquierdo + Tablero */}
        <div className="board-container">
          
          {/* COLUMNA IZQUIERDA: SIGUIENTE PIEZA + BOTÓN PAUSA */}
          <div className="side-panel">
            <div className="next-piece-box">
              <span className="next-label">SIGUIENTE</span>
              <div className="next-piece-grid">
                {siguientePieza && siguientePieza.shape.map((row, y) => (
                  <div key={y} style={{ display: 'flex' }}>
                    {row.map((cell, x) => (
                      <div
                        key={x}
                        className="next-cell"
                        style={{
                          backgroundColor: cell ? siguientePieza.color : 'transparent',
                          borderRadius: '2px',
                          border: cell ? '1px solid rgba(255,255,255,0.3)' : 'none'
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <button 
              className={`pause-btn ${pausado ? 'active' : ''}`}
              onClick={togglePausa} 
            >
              {pausado ? '▶ Reanudar' : '⏸ Pausa'}
            </button>
          </div>

          {/* TABLERO CON OVERLAY DE PAUSA */}
          <div 
            className="board"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: isTouchDevice ? 'none' : 'auto' }}
          >
            {tableroVisual.map((row, y) => (
              <div key={y} className="board-row">
                {row.map((cell, x) => (
                  <div
                    key={`${y}-${x}`}
                    className="cell"
                    style={{ backgroundColor: cell || 'rgba(0, 0, 0, 0.4)', borderColor: cell ? '#111' : 'rgba(255, 255, 255, 0.1)' }}
                  />
                ))}
              </div>
            ))}

            {/* OVERLAY DE PAUSA */}
            {pausado && (
              <div className="pause-overlay">
                <h2>⏸ PAUSA</h2>
                <button className="resume-btn" onClick={togglePausa}>
                  ▶ Reanudar
                </button>
              </div>
            )}
          </div>

        </div>

        {/* CONTROLES FLECHA (Solo en PC) */}
        {!isTouchDevice && (
          <div className="touch-controls">
            <button onClick={() => moverPieza(-1, 0)}>←</button>
            <button onClick={() => rotarPieza()}>↑</button>
            <button onClick={() => moverPieza(0, 1)}>↓</button>
            <button onClick={() => moverPieza(1, 0)}>→</button>
          </div>
        )}

      </div>

      {/* MODAL GAME OVER */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>💀 Game Over</h2>
            <div className="modal-stats">
              <p>Puntuación: <strong className="score-highlight">{puntuacion}</strong></p>
              <p>Tiempo: <strong>{formatTime(time)}</strong></p>
            </div>
            
            <div className="modal-form">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Tu nombre para el ranking"
              />
              <button className="btn-primary" onClick={handleSaveAndRestart} disabled={saving || !playerName.trim()}>
                {saving ? 'Guardando...' : '💾 Guardar y Jugar'}
              </button>
            </div>
            
            <button className="btn-secondary" onClick={handlePlayAgain} style={{marginTop: '10px'}}>
              🔄 Jugar de nuevo (Sin guardar)
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const RankingScreen = ({ onGoMenu }) => {
  const [ranking, setRanking] = useState([])

  useEffect(() => {
    const fetchRanking = async () => {
      const data = await RankingService.getTop10()
      setRanking(data)
    }
    fetchRanking()
  }, [])

  return (
    <div className="ranking-screen">
      <div className="ranking-card">
        <div className="ranking-header">
          <button className="btn-back" onClick={onGoMenu}>← Menú</button>
          <h2>🏆 Ranking Global</h2>
          <div></div>
        </div>

        <div className="ranking-list-full">
          {ranking.length === 0 && <p className="empty-ranking">Aún no hay puntuaciones. ¡Sé el primero!</p>}
          <ol>
            {ranking.map((item, index) => (
              <li key={item.id} className={`rank-item rank-${index + 1}`}>
                <span className="rank-pos">{index + 1}.</span>
                <span className="rank-name">{item.playerName}</span>
                <strong className="rank-score">{item.score}</strong>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [screen, setScreen] = useState('menu')
  const [gameDifficulty, setGameDifficulty] = useState('medium')

  const handleStartGame = (difficulty) => {
    setGameDifficulty(difficulty)
    setScreen('game')
  }

  return (
    <>
      {screen === 'menu' && <MenuScreen onStartGame={handleStartGame} onViewRanking={() => setScreen('ranking')} />}
      {screen === 'game' && <GameScreen difficulty={gameDifficulty} onGoMenu={() => setScreen('menu')} />}
      {screen === 'ranking' && <RankingScreen onGoMenu={() => setScreen('menu')} />}
    </>
  )
}