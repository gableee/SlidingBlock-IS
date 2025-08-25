
import { useState, useEffect } from 'react';
import './App.css';

function shuffle(array) {
  let arr = array.slice();
  let n = arr.length;
  do {
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  } while (!isSolvable(arr));
  return arr;
}

function isSolvable(tiles) {
  let invCount = 0;
  for (let i = 0; i < 15; i++) {
    for (let j = i + 1; j < 16; j++) {
      if (tiles[i] && tiles[j] && tiles[i] > tiles[j]) invCount++;
    }
  }

  const emptyRowFromBottom = 3 - Math.floor(tiles.indexOf(0) / 4);
  return (invCount + emptyRowFromBottom) % 2 === 0;
}


function isSolved(tiles) {
  for (let i = 0; i < 15; i++) {
    if (tiles[i] !== i + 1) return false;
  }
  return tiles[15] === 0;
}


function App() {
  const [tiles, setTiles] = useState([]);
  const [won, setWon] = useState(false);
  const [moveCount, setMoveCount] = useState(0);

  useEffect(() => {
    const initial = shuffle([...Array(15).keys()].map(x => x + 1).concat(0));
    setTiles(initial);
    setWon(false);
    setMoveCount(0);
  }, []);

  const moveTile = idx => {
    const empty = tiles.indexOf(0);
    const validMoves = [empty - 1, empty + 1, empty - 4, empty + 4];
    if (validMoves.includes(idx) &&
      ((Math.abs(idx - empty) === 1 && Math.floor(idx / 4) === Math.floor(empty / 4)) ||
        Math.abs(idx - empty) === 4)) {
      const newTiles = tiles.slice();
      [newTiles[empty], newTiles[idx]] = [newTiles[idx], newTiles[empty]];
      setTiles(newTiles);
      setMoveCount(c => c + 1);
      if (isSolved(newTiles)) setWon(true);
    }
  };

  const handleShuffle = () => {
    const shuffled = shuffle([...Array(15).keys()].map(x => x + 1).concat(0));
    setTiles(shuffled);
    setWon(false);
    setMoveCount(0);
  };

  return (
    <div className="fifteen-puzzle-container">
      <h1>15 Puzzle Game</h1>
      <div className="move-count">Moves: {moveCount}</div>
      <div className="puzzle-grid">
        {tiles.map((tile, idx) => (
          <button
            key={idx}
            className={tile === 0 ? 'tile empty' : 'tile'}
            onClick={() => moveTile(idx)}
            disabled={tile === 0 || won}
          >
            {tile !== 0 ? tile : ''}
          </button>
        ))}
      </div>
      <div className="controls">
        <button onClick={handleShuffle}>{won ? "Play Again" : "Shuffle"}</button>
        {won && <div className="win-message">🎉 You solved it!</div>}
      </div>
    </div>
  );
}

export default App;
