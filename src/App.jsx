import { useEffect, useState, useRef } from 'react'
import './App.css'
import { useTetris } from './hooks/useTetris'
import { RankingService } from './services/data'

// 🟢 FONDOS DE NATURALEZA (National Geographic Style) 🟢
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
  const { tableroVisual, puntuacion, gameOver, reiniciarJuego, moverPieza, rotarPieza } = useTetris(difficulty)
  const [showModal, setShowModal] = useState(false)
  const [playerName, setPlayerName] = useState('Jugador')
  const [saving, setSaving] = useState(false)
  
  // 🟢 TEMPORIZADOR 🟢
  const [time, setTime] = useState(0)
  const timerRef = useRef(null)

  // 🆕 DETECCIÓN AUTOMÁTICA DE DISPOSITIVO TÁCTIL 🆕
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detecta si el dispositivo tiene pantalla táctil (móvil o tablet)
    const hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    setIsTouchDevice(hasTouch);
  }, []);

  // 🆕 LÓGICA TÁCTIL (Solo se activará si isTouchDevice es true) 🆕
  const touchStartRef = useRef({ x: 0, y: 0 });
  const UMBRAL_SWIPE = 20; 

  const handleTouchStart = (e) => {
    if (!isTouchDevice) return; // Si es PC, ignora el toque
    e.preventDefault(); 
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e) => {
    if (!isTouchDevice) return; // Si es PC, ignora el toque
    e.preventDefault();
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    // Si el movimiento es muy corto, es un TAP (Rotar pieza)
    if (Math.abs(deltaX) < UMBRAL_SWIPE && Math.abs(deltaY) < UMBRAL_SWIPE) {
      rotarPieza();
      return;
    }

    // Si el movimiento es largo, es un SWIPE (Mover pieza)
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      moverPieza(deltaX > 0 ? 1 : -1, 0);
    } else {
      if (deltaY > 0) moverPieza(0, 1); 
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

  // 🟢 FONDO DINÁMICO 🟢
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
        <div className="game-top-bar">
          <button className="btn-back" onClick={onGoMenu}>← Menú</button>
          <div className="timer-display">⏱️ {formatTime(time)}</div>
          <div className="score-display">Score: <strong>{puntuacion}</strong></div>
          <div className="difficulty-badge">{difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Media' : 'Difícil'}</div>
        </div>

        <div 
          className="board-container"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: isTouchDevice ? 'none' : 'auto' }} // Evita scroll solo en móviles
        >
          <div className="board">
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
          </div>
        </div>

        {/* 🆕 MOSTRAR BOTONES SINO ES TÁCTIL, O INSTRUCCIONES SI LO ES 🆕 */}
        {!isTouchDevice ? (
          <div className="touch-controls">
            <button onClick={() => moverPieza(-1, 0)}>←</button>
            <button onClick={() => rotarPieza()}>↑</button>
            <button onClick={() => moverPieza(0, 1)}>↓</button>
            <button onClick={() => moverPieza(1, 0)}>→</button>
          </div>
        ) : (
           <div className="hint-text" style={{color: 'white', textAlign: 'center', marginTop: '10px', fontSize: '0.9rem'}}>
             👆 Toca para rotar · Desliza para mover
           </div>
        )}

      </div>

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