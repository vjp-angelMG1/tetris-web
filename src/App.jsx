import { useEffect, useState } from 'react'
import './App.css'
import { useTetris } from './hooks/useTetris'
import { RankingService } from './services/data'

function App() {
  const { tableroVisual, puntuacion, gameOver, reiniciarJuego } = useTetris()
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
        <h1>Tetris Web</h1>
        <p>Juego web puro + Firebase Firestore</p>
      </header>

      <main className="content">
        <section className="game-panel">
          <div className="status-bar">
            <div>Score: <strong>{puntuacion}</strong></div>
            <div>{gameOver ? 'Game Over' : 'En juego'}</div>
          </div>

          <div className="board">
            {tableroVisual.map((row, y) => (
              <div key={y} className="board-row">
                {row.map((cell, x) => (
                  <div
                    key={`${y}-${x}`}
                    className="cell"
                    style={{ backgroundColor: cell || 'transparent', borderColor: cell ? '#111' : '#555' }}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="actions">
            <button onClick={reiniciarJuego}>Reiniciar juego</button>
            <button onClick={handleSaveScore} disabled={saving || puntuacion === 0}>
              Guardar puntuación
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
        </section>

        {/* RANKING INTEGRADO AQUÍ PARA EVITAR ERRORES DE IMPORTACIÓN */}
        <section className="ranking-panel">
          <h2>Ranking Firestore</h2>
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
        Usa las flechas para mover la pieza y la flecha arriba para rotar.
      </footer>
    </div>
  )
}

export default App
