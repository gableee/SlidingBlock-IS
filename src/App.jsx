
import { useState, useEffect } from 'react';
import './App.css';

function shuffle(array, size) {
  let arr = array.slice();
  let n = arr.length;
  do {
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  } while (!isSolvable(arr, size));
  return arr;
}

function isSolvable(tiles, size) {
  let inversionCount = 0;
  const total = size * size;
  for (let i = 0; i < total - 1; i++) {
    for (let j = i + 1; j < total; j++) {
      if (tiles[i] && tiles[j] && tiles[i] > tiles[j]) inversionCount++;
    }
  }

  if (size % 2 === 1) {
    // Odd grid: inversions must be even
    return inversionCount % 2 === 0;
  }
  // Even grid: blank row from bottom (1-based)
  const emptyRowFromBottom = size - Math.floor(tiles.indexOf(0) / size);
  // Solvable if (inversions + blankRowFromBottom) is odd
  return (inversionCount + emptyRowFromBottom) % 2 === 1;
}

function isSolved(tiles, size) {
  const total = size * size;
  for (let i = 0; i < total - 1; i++) {
    if (tiles[i] !== i + 1) return false;
  }
  return tiles[total - 1] === 0;
}

function createTiles(size) {
  return [...Array(size * size - 1).keys()].map(x => x + 1).concat(0);
}

// Pure BFS solver for 3x3 only
function solvePuzzleBFS(tiles, size) {
  if (size !== 3) return null; // Only for 3x3
  
  const goal = createTiles(size);
  if (JSON.stringify(tiles) === JSON.stringify(goal)) return [];

  const getNeighbors = (state) => {
    const emptyIndex = state.indexOf(0);
    const [emptyRow, emptyCol] = [Math.floor(emptyIndex / size), emptyIndex % size];
    const neighbors = [];
    
    // Define possible moves: up, down, left, right
    const moves = [
      [emptyRow - 1, emptyCol, 'w'], // up
      [emptyRow + 1, emptyCol, 's'], // down  
      [emptyRow, emptyCol - 1, 'a'], // left
      [emptyRow, emptyCol + 1, 'd']  // right
    ];

    for (const [newRow, newCol, move] of moves) {
      if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size) {
        const newIndex = newRow * size + newCol;
        const newState = [...state];
        [newState[emptyIndex], newState[newIndex]] = [newState[newIndex], newState[emptyIndex]];
        neighbors.push({ state: newState, move });
      }
    }
    return neighbors;
  };

  // Pure BFS - no heuristics, just breadth-first search
  const queue = [{ state: tiles, path: [] }];
  const visited = new Set();
  
  while (queue.length > 0) {
    const current = queue.shift();
    const stateKey = JSON.stringify(current.state);

    if (JSON.stringify(current.state) === JSON.stringify(goal)) {
      return current.path;
    }

    if (visited.has(stateKey)) continue;
    visited.add(stateKey);

    const neighbors = getNeighbors(current.state);
    for (const neighbor of neighbors) {
      const neighborKey = JSON.stringify(neighbor.state);
      if (visited.has(neighborKey)) continue;

      const newPath = [...current.path, neighbor.move];
      queue.push({
        state: neighbor.state,
        path: newPath
      });
    }
  }

  return null; // No solution found
}

function App() {
  const [gridSize, setGridSize] = useState(3); // Default to 3x3
  const [tiles, setTiles] = useState([]);
  const [won, setWon] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [isSolving, setIsSolving] = useState(false);

  useEffect(() => {
    const initial = shuffle(createTiles(gridSize), gridSize);
    setTiles(initial);
    setWon(false);
    setMoveCount(0);
    setIsSolving(false);
  }, [gridSize]);

  const moveTile = idx => {
    if (isSolving) return; // Prevent moves while solving
    
    const empty = tiles.indexOf(0);
    const validMoves = [empty - 1, empty + 1, empty - gridSize, empty + gridSize];
    if (validMoves.includes(idx) &&
      ((Math.abs(idx - empty) === 1 && Math.floor(idx / gridSize) === Math.floor(empty / gridSize)) ||
        Math.abs(idx - empty) === gridSize)) {
      const newTiles = tiles.slice();
      [newTiles[empty], newTiles[idx]] = [newTiles[idx], newTiles[empty]];
      setTiles(newTiles);
      setMoveCount(c => c + 1);
      if (isSolved(newTiles, gridSize)) setWon(true);
    }
  };

  const handleShuffle = () => {
    const shuffled = shuffle(createTiles(gridSize), gridSize);
    setTiles(shuffled);
    setWon(false);
    setMoveCount(0);
    setIsSolving(false);
  };

  const handleSolve = () => {
    if (gridSize !== 3) return; // Only solve 3x3
    
    setIsSolving(true);
    const solution = solvePuzzleBFS(tiles, gridSize);
    
    if (solution) {
      let currentTiles = [...tiles];
      let step = 0;
      
      const solveStep = () => {
        if (step < solution.length) {
          const move = solution[step];
          const emptyIndex = currentTiles.indexOf(0);
          const [emptyRow, emptyCol] = [Math.floor(emptyIndex / gridSize), emptyIndex % gridSize];
          
          // Calculate target position based on move direction
          let target = null;
          if (move === 'w' && emptyRow > 0) target = emptyIndex - gridSize;
          if (move === 's' && emptyRow < gridSize - 1) target = emptyIndex + gridSize;
          if (move === 'a' && emptyCol > 0) target = emptyIndex - 1;
          if (move === 'd' && emptyCol < gridSize - 1) target = emptyIndex + 1;
          
          if (target !== null) {
            // Apply the move directly to state
            const newTiles = [...currentTiles];
            [newTiles[emptyIndex], newTiles[target]] = [newTiles[target], newTiles[emptyIndex]];
            setTiles(newTiles);
            setMoveCount(c => c + 1);
            currentTiles = newTiles;
          }
          
          step++;
          
          // Continue with next move
          setTimeout(solveStep, 300); // 300ms delay between moves
        } else {
          // All moves completed, check if solved
          if (isSolved(currentTiles, gridSize)) {
            setWon(true);
          }
          setIsSolving(false);
        }
      };
      
      // Start the solving process
      solveStep();
    } else {
      setIsSolving(false);
      alert('No solution found!');
    }
  };

  const handleSizeChange = (newSize) => {
    setGridSize(newSize);
  };

  return (
    <div className="fifteen-puzzle-container">
      <h1>Sliding Block Puzzle</h1>
      
      {/* Size Selector */}
      <div className="size-selector">
        <button 
          className={gridSize === 3 ? 'active' : ''} 
          onClick={() => handleSizeChange(3)}
          disabled={isSolving}
        >
          3x3
        </button>
        <button 
          className={gridSize === 4 ? 'active' : ''} 
          onClick={() => handleSizeChange(4)}
          disabled={isSolving}
        >
          4x4
        </button>
      </div>

      <div className="move-count">Moves: {moveCount}</div>
      
      <div className="puzzle-grid" style={{ 
        gridTemplateColumns: `repeat(${gridSize}, 60px)`,
        gridTemplateRows: `repeat(${gridSize}, 60px)`
      }}>
        {tiles.map((tile, idx) => (
          <button
            key={idx}
            className={tile === 0 ? 'tile empty' : 'tile'}
            onClick={() => moveTile(idx)}
            disabled={tile === 0 || won || isSolving}
          >
            {tile !== 0 ? tile : ''}
          </button>
        ))}
      </div>
      
      <div className="controls">
        <button onClick={handleShuffle} disabled={isSolving}>
          {won ? "Play Again" : "Shuffle"}
        </button>
        
        <button onClick={handleSolve} disabled={won || isSolving || gridSize !== 3}>
          {isSolving ? "Solving..." : "Solve"}
        </button>
      </div>
      
      {won && <div className="win-message">🎉 Puzzle Solved!</div>}
      

    </div>
  );
}

export default App;
