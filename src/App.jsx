import { useEffect, useState } from 'react'
import './App.css'
import { useTetris } from './hooks/useTetris'
import { RankingService } from './services/data'

function App() {
  const [difficulty, setDifficulty] = useState('medium') // 🟢 Estado de dificultad
  const { tableroVisual, puntuacion, gameOver, reiniciarJuego, moverPieza, rotarPieza } = useTetris({ difficulty })
  
  const [playerName, setPlayerName] = useState('Jugador')
  const [ranking, setRanking] = useState([])
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)

  const loadRanking = async () => {
    try {
      const top = await RankingService.getTop10()
      setRanking(top)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    loadRanking()
  }, [])

  const handleSaveScore = async () => {
    if (!playerName.trim()) {
      setStatus('Introduce un nombre antes de guardar.')
      return
    }
    setSaving(true)
    setStatus('Guardando puntuación...')
    await RankingService.saveScore(playerName.trim(), puntuacion)
    await loadRanking()
    setStatus('Puntuación guardada en Firestore.')
    setSaving(false)
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Tetris <span>Web</span></h1>
        <p>Juego web puro + Firebase Firestore</p>
      </header>

      <main className="content">
        <section className="game-panel">
          <div className="status-bar">
            <div>Score: <strong>{puntuacion}</strong></div>
            <div className={gameOver ? 'game-over' : 'en-juego'}>{gameOver ? 'Game Over' : 'En juego'}</div>
          </div>

          {/* 🟢 SELECTOR DE DIFICULTAD 🟢 */}
          <div className="difficulty-selector">
            <button 
              className={difficulty === 'easy' ? 'diff-active' : ''} 
              onClick={() => setDifficulty('easy')}
            >
              Fácil
            </button>
            <button 
              className={difficulty === 'medium' ? 'diff-active' : ''} 
              onClick={() => setDifficulty('medium')}
            >
              Media
            </button>
            <button 
              className={difficulty === 'hard' ? 'diff-active' : ''} 
              onClick={() => setDifficulty('hard')}
            >
              Difícil
            </button>
          </div>

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

          <div className="controls-section">
            <div className="actions">
              <button onClick={reiniciarJuego}>Reiniciar</button>
              <button onClick={handleSaveScore} disabled={saving || puntuacion === 0}>
                {saving ? 'Guardando...' : 'Guardar Puntos'}
              </button>
            </div>

            <div className="form-row">
              <label htmlFor="playerName">Nombre:</label>
              <input
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Jugador"
              />
            </div>
            {status && <div className="message">{status}</div>}
            
            <div className="touch-controls">
              <button onClick={() => moverPieza(-1, 0)}>←</button>
              <button onClick={() => rotarPieza()}>↑</button>
              <button onClick={() => moverPieza(0, 1)}>↓</button>
              <button onClick={() => moverPieza(1, 0)}>→</button>
            </div>
          </div>
        </section>

        <section className="ranking-panel">
          <h2>🏆 Ranking</h2>
          <div className="ranking-list">
            {ranking.length === 0 && <p>No hay puntuaciones todavía.</p>}
            <ol>
              {ranking.map((item, index) => (
                <li key={item.id}>
                  <span>{index + 1}. {item.playerName}</span>
                  <strong>{item.score}</strong>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-links">
          <a href="#" target="_blank" rel="noopener noreferrer">Política de Privacidad</a>
          <span>•</span>
          <a href="#" target="_blank" rel="noopener noreferrer">Términos y Condiciones</a>
          <span>•</span>
          <a href="#" target="_blank" rel="noopener noreferrer">Contacto</a>
        </div>
        <p>© {new Date().getFullYear()} Tetris Web. Todos los derechos reservados.</p>
        <p>Hecho por <strong>Ángel Montero Gregorio</strong></p>
      </footer>
    </div>
  )
}

export default App
