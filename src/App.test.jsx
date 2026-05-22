import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

jest.mock('./hooks/useTetris', () => ({
  useTetris: () => ({
    tableroVisual: Array(20).fill(Array(10).fill(0)),
    puntuacion: 0,
    gameOver: false,
    reiniciarJuego: jest.fn(),
    moverPieza: jest.fn(),
    rotarPieza: jest.fn()
  })
}));

jest.mock('./services/data', () => ({
  RankingService: {
    getTop10: jest.fn().mockResolvedValue([])
  }
}));

describe('App Navigation - Tests de Integración', () => {
  it('1. Debería mostrar la pantalla de menú al cargar', () => {
    render(<App />);
    expect(screen.getByText('Nuevo Juego')).toBeInTheDocument();
    expect(screen.queryByText('💀 Game Over')).not.toBeInTheDocument();
  });

  it('2. Debería navegar al juego al hacer clic en "Nuevo Juego"', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const startButton = screen.getByText('🎮 Nuevo Juego');
    await user.click(startButton);
    
    expect(screen.getByText('← Menú')).toBeInTheDocument();
    expect(screen.queryByText('Nuevo Juego')).not.toBeInTheDocument();
  });

  it('3. Debería navegar al ranking al hacer clic en "Ver Ranking"', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const rankingButton = screen.getByText('🏆 Ver Ranking');
    await user.click(rankingButton);
    
    expect(screen.getByText('🏆 Ranking Global')).toBeInTheDocument();
    expect(screen.queryByText('Nuevo Juego')).not.toBeInTheDocument();
  });

  it('4. Debería volver al menú desde el juego', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    await user.click(screen.getByText('🎮 Nuevo Juego'));
    expect(screen.getByText('← Menú')).toBeInTheDocument();
    
    await user.click(screen.getByText('← Menú'));
    expect(screen.getByText('Nuevo Juego')).toBeInTheDocument();
  });
});