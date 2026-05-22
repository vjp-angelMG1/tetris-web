import { useEffect, useState } from 'react'
import './App.css'
import { useTetris } from './hooks/useTetris'
import { RankingService } from './services/data'

// 🟢 PANTALLA DE MENÚ PRINCIPAL 🟢
const MenuScreen = ({ onStartGame, onViewRanking }) => {
  const [difficulty, setDifficulty] = useState('medium')

  return (
    <div className="menu-screen">
      <div className="menu-card">
        <h1>Tetris <span>Web</span></h1>
        <p>Juego web puro + Firebase</p>

        <div className="menu-section">
          <h3>Selecciona Dificultad</h3>
          <div className="difficulty-selector">
            <button className={difficulty === 'easy' ? 'diff-active' : ''} onClick={() => setDifficulty('easy')}>Fácil</button>
            <button className={difficulty === 'medium' ? 'diff-active' : ''} onClick={() => setDifficulty('medium')}>Media</button>
            <button className={difficulty === 'hard' ? 'diff-active' : ''} onClick={() => setDifficulty('hard')}>Difícil</button>
          </div>
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

// 🟢 PANTALLA DE JUEGO (LIMPIA, SOLO TABLERO) 🟢
const GameScreen = ({ difficulty, onGoMenu }) => {
  const { tableroVisual, puntuacion, gameOver, reiniciarJuego, moverPieza, rotarPieza } = useTetris(difficulty)
  const [showModal, setShowModal] = useState(false)
  const [playerName, setPlayerName] = useState('Jugador')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (gameOver) {
      setShowModal(true)
    }
  }, [gameOver])

  const handleSaveAndRestart = async () => {
    if (!playerName.trim()) return
    setSaving(true)
    await RankingService.saveScore(playerName.trim(), puntuacion)
    setSaving(false)
    setShowModal(false)
    reiniciarJuego()
  }

  const handlePlayAgain = () => {
    setShowModal(false)
    reiniciarJuego()
  }

  return (
    <div className="game-screen">
      <div className="game-top-bar">
        <button className="btn-back" onClick={onGoMenu}>← Menú</button>
        <div className="score-display">Score: <strong>{puntuacion}</strong></div>
        <div className="difficulty-badge">{difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Media' : 'Difícil'}</div>
      </div>

      <div className="board-container">
        <div className="board">
          {tableroVisual.map((row, y) => (
            <div key={y} className="board-row">
              {row.map((cell, x) => (
                <div
                  key={`${y}-${x}`}
                  className="cell"
                  style={{ backgroundColor: cell || 'transparent', borderColor: cell ? '#111' : '#333' }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="touch-controls">
        <button onClick={() => moverPieza(-1, 0)}>←</button>
        <button onClick={() => rotarPieza()}>↑</button>
        <button onClick={() => moverPieza(0, 1)}>↓</button>
        <button onClick={() => moverPieza(1, 0)}>→</button>
      </div>

      {/* 🟢 MODAL DE GAME OVER 🟢 */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>💀 Game Over</h2>
            <p>Tu puntuación: <strong className="score-highlight">{puntuacion}</strong></p>
            
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

// 🟢 PANTALLA DE RANKING 🟢
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
          <div></div> {/* Spacer para centrar el título */}
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

// 🟢 COMPONENTE PRINCIPAL QUE CAMBIA DE PANTALLA 🟢
export default function App() {
  const [screen, setScreen] = useState('menu') // 'menu', 'game', 'ranking'
  const [gameDifficulty, setGameDifficulty] = useState('medium')

  const handleStartGame = (difficulty) => {
    setGameDifficulty(difficulty)
    setScreen('game')
  }

  return (
    <>
      {screen === 'menu' && (
        <MenuScreen onStartGame={handleStartGame} onViewRanking={() => setScreen('ranking')} />
      )}
      {screen === 'game' && (
        <GameScreen difficulty={gameDifficulty} onGoMenu={() => setScreen('menu')} />
      )}
      {screen === 'ranking' && (
        <RankingScreen onGoMenu={() => setScreen('menu')} />
      )}
    </>
  )
}