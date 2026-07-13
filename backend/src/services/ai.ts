import { Hole, getNextIndex, MatchState } from './gameEngine';

export interface AIMove {
  holeIndex: number;
  direction: 'cw' | 'ccw';
}

// Simulated sowing function that calculates captured stones count
const simulateMove = (boardInput: Hole[], startHole: number, direction: 'cw' | 'ccw'): { capturedStones: number; newBoard: Hole[] } => {
  const board = boardInput.map((h) => ({ ...h }));
  let hand = board[startHole].stones;
  board[startHole].stones = 0;
  let currentHole = startHole;

  let capturedStones = 0;

  while (hand > 0) {
    currentHole = getNextIndex(currentHole, direction);
    board[currentHole].stones += 1;
    hand -= 1;

    if (hand === 0) {
      const nextHole = getNextIndex(currentHole, direction);

      if (board[nextHole].stones > 0 && !board[nextHole].isMandarin) {
        hand = board[nextHole].stones;
        board[nextHole].stones = 0;
        currentHole = nextHole;
        continue;
      }

      if (board[nextHole].isMandarin) {
        break;
      }

      if (board[nextHole].stones === 0) {
        let testEmptyHole = nextHole;
        while (true) {
          const captureTarget = getNextIndex(testEmptyHole, direction);
          if (board[captureTarget].stones > 0) {
            const targetStones = board[captureTarget].stones;
            const isMandarin = board[captureTarget].isMandarin;

            capturedStones += isMandarin ? (targetStones - 1 + 10) : targetStones;
            board[captureTarget].stones = 0;
            if (isMandarin) {
              board[captureTarget].isMandarin = false;
            }

            const afterCapture = getNextIndex(captureTarget, direction);
            if (board[afterCapture].stones === 0) {
              testEmptyHole = afterCapture;
            } else {
              break;
            }
          } else {
            break;
          }
        }
        break;
      }
    }
  }

  return { capturedStones, newBoard: board };
};

// Get list of all valid moves for a player ('player1' -> 0..4, 'player2' -> 5..9)
const getValidMoves = (board: Hole[], playerKey: 'player1' | 'player2'): AIMove[] => {
  const startIndex = playerKey === 'player1' ? 0 : 5;
  const endIndex = playerKey === 'player1' ? 4 : 9;
  const moves: AIMove[] = [];

  for (let i = startIndex; i <= endIndex; i++) {
    if (board[i].stones > 0) {
      moves.push({ holeIndex: i, direction: 'cw' });
      moves.push({ holeIndex: i, direction: 'ccw' });
    }
  }

  return moves;
};

// Evaluate the board position for Player 2 (AI)
const evaluateBoard = (board: Hole[], p2Stones: number, p1Stones: number): number => {
  // Stones on P2 (AI) side (5..9)
  let p2Side = 0;
  for (let i = 5; i <= 9; i++) {
    p2Side += board[i].stones;
  }

  // Stones on P1 (Human) side (0..4)
  let p1Side = 0;
  for (let i = 0; i <= 4; i++) {
    p1Side += board[i].stones;
  }

  return (p2Stones + p2Side) - (p1Stones + p1Side);
};

// Minimax search with alpha-beta pruning
const minimax = (
  board: Hole[],
  depth: number,
  isMaximizing: boolean,
  p1Stones: number,
  p2Stones: number,
  alpha: number,
  beta: number
): { score: number; move: AIMove | null } => {
  // Check terminal state
  const mandarinRightEmpty = board[10].stones === 0 && !board[10].isMandarin;
  const mandarinLeftEmpty = board[11].stones === 0 && !board[11].isMandarin;
  if (depth === 0 || (mandarinRightEmpty && mandarinLeftEmpty)) {
    return { score: evaluateBoard(board, p2Stones, p1Stones), move: null };
  }

  if (isMaximizing) {
    let maxScore = -Infinity;
    let bestMove: AIMove | null = null;
    const moves = getValidMoves(board, 'player2');

    if (moves.length === 0) {
      // Out of stones, AI must borrow/distribute 5 stones
      const nextBoard = board.map((h) => ({ ...h }));
      for (let i = 5; i <= 9; i++) nextBoard[i].stones = 1;
      return minimax(nextBoard, depth - 1, false, p1Stones, p2Stones - 5, alpha, beta);
    }

    for (const move of moves) {
      const { capturedStones, newBoard } = simulateMove(board, move.holeIndex, move.direction);
      const res = minimax(newBoard, depth - 1, false, p1Stones, p2Stones + capturedStones, alpha, beta);
      if (res.score > maxScore) {
        maxScore = res.score;
        bestMove = move;
      }
      alpha = Math.max(alpha, res.score);
      if (beta <= alpha) break; // Beta cut-off
    }
    return { score: maxScore, move: bestMove };
  } else {
    let minScore = Infinity;
    let bestMove: AIMove | null = null;
    const moves = getValidMoves(board, 'player1');

    if (moves.length === 0) {
      // Out of stones, P1 must borrow/distribute 5 stones
      const nextBoard = board.map((h) => ({ ...h }));
      for (let i = 0; i <= 4; i++) nextBoard[i].stones = 1;
      return minimax(nextBoard, depth - 1, true, p1Stones - 5, p2Stones, alpha, beta);
    }

    for (const move of moves) {
      const { capturedStones, newBoard } = simulateMove(board, move.holeIndex, move.direction);
      const res = minimax(newBoard, depth - 1, true, p1Stones + capturedStones, p2Stones, alpha, beta);
      if (res.score < minScore) {
        minScore = res.score;
        bestMove = move;
      }
      beta = Math.min(beta, res.score);
      if (beta <= alpha) break; // Alpha cut-off
    }
    return { score: minScore, move: bestMove };
  }
};

export class AIEngine {
  public static calculateMove(state: MatchState): AIMove {
    const validMoves = getValidMoves(state.board, 'player2');
    
    if (validMoves.length === 0) {
      // No moves available, AI should just return anything, the game will handle out-of-stones distribution
      return { holeIndex: 5, direction: 'cw' };
    }

    const mode = state.mode;

    // --- EASY AI ---
    if (mode === 'ai_easy') {
      const idx = Math.floor(Math.random() * validMoves.length);
      return validMoves[idx];
    }

    // --- MEDIUM AI (Greedy 1-step search) ---
    if (mode === 'ai_medium') {
      let bestMove = validMoves[0];
      let maxCapture = -1;

      for (const move of validMoves) {
        const { capturedStones } = simulateMove(state.board, move.holeIndex, move.direction);
        if (capturedStones > maxCapture) {
          maxCapture = capturedStones;
          bestMove = move;
        }
      }

      // If no move captures anything, choose randomly to make it human-like
      if (maxCapture === 0) {
        const idx = Math.floor(Math.random() * validMoves.length);
        return validMoves[idx];
      }

      return bestMove;
    }

    // --- HARD AI (Minimax depth 3-4 with alpha-beta) ---
    const { move } = minimax(state.board, 3, true, state.player1.stonesCaptured, state.player2.stonesCaptured, -Infinity, Infinity);
    return move || validMoves[0];
  }

  // Determine if the AI will answer the quiz question correctly
  public static simulateQuizAnswer(mode: MatchState['mode'], questionOptionCount = 4): boolean {
    const accuracy = mode === 'ai_hard' ? 0.90 : mode === 'ai_medium' ? 0.75 : 0.50;
    return Math.random() < accuracy;
  }
}
