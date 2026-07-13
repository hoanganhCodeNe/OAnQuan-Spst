import { QueryResult } from 'pg';
import { query } from '../config/db';

export interface Hole {
  stones: number;
  isMandarin: boolean;
}

export interface PlayerState {
  id: string;
  name: string;
  stonesCaptured: number;
  quizPoints: number;
  unlockedChapters: number[];
}

export interface CapturedHoleInfo {
  index: number;
  stones: number;
  isMandarin: boolean;
}

export interface PendingQuiz {
  playerIndex: 1 | 2;
  chapter: number;
  questionId: number;
  questionContent: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correctAnswer: string;
  explanation: string;
  capturedStones: number;
  capturedHoles: CapturedHoleInfo[];
}

export interface MatchState {
  matchId: string;
  mode: 'pvp' | 'ai_easy' | 'ai_medium' | 'ai_hard';
  board: Hole[];
  player1: PlayerState;
  player2: PlayerState;
  currentTurn: 'player1' | 'player2';
  status: 'waiting' | 'playing' | 'finished';
  winnerId: string | null;
  winnerName: string | null;
  pendingQuiz: PendingQuiz | null;
  gameLog: string[];
  createdAt: number;
}

// Circular board track index mapping:
// 0, 1, 2, 3, 4 (P1 Citizen Holes)
// 10 (Right Mandarin)
// 5, 6, 7, 8, 9 (P2 Citizen Holes)
// 11 (Left Mandarin)
const BOARD_ORDER = [0, 1, 2, 3, 4, 10, 5, 6, 7, 8, 9, 11];

export const getNextIndex = (current: number, direction: 'cw' | 'ccw'): number => {
  const currIdx = BOARD_ORDER.indexOf(current);
  if (direction === 'ccw') {
    // Counter-clockwise: increasing index in BOARD_ORDER
    const nextIdx = (currIdx + 1) % BOARD_ORDER.length;
    return BOARD_ORDER[nextIdx];
  } else {
    // Clockwise: decreasing index in BOARD_ORDER
    const nextIdx = (currIdx - 1 + BOARD_ORDER.length) % BOARD_ORDER.length;
    return BOARD_ORDER[nextIdx];
  }
};

export const initializeBoard = (): Hole[] => {
  const board: Hole[] = [];
  for (let i = 0; i < 12; i++) {
    if (i === 10 || i === 11) {
      board[i] = { stones: 1, isMandarin: true }; // 1 big mandarin stone
    } else {
      board[i] = { stones: 5, isMandarin: false }; // 5 citizen stones
    }
  }
  return board;
};

export const getChapterFromHole = (holeIndex: number): number => {
  if (holeIndex >= 0 && holeIndex <= 4) {
    return holeIndex + 1; // Chapters 1 to 5
  }
  if (holeIndex >= 5 && holeIndex <= 9) {
    return holeIndex + 1; // Chapters 6 to 10
  }
  return 11; // Mandarin holes (10, 11) -> Chapter 11
};

export class MatchEngine {
  public state: MatchState;

  constructor(matchId: string, mode: MatchState['mode'], p1Id: string, p1Name: string, p2Id: string, p2Name: string) {
    this.state = {
      matchId,
      mode,
      board: initializeBoard(),
      player1: { id: p1Id, name: p1Name, stonesCaptured: 0, quizPoints: 0, unlockedChapters: [] },
      player2: { id: p2Id, name: p2Name, stonesCaptured: 0, quizPoints: 0, unlockedChapters: [] },
      currentTurn: 'player1',
      status: 'playing',
      winnerId: null,
      winnerName: null,
      pendingQuiz: null,
      gameLog: ['Trận đấu bắt đầu! Lượt chơi đầu tiên thuộc về ' + p1Name],
      createdAt: Date.now(),
    };
  }

  // Handle out-of-stones (Sản quân)
  public handleOutOfStones() {
    const activePlayer = this.state.currentTurn === 'player1' ? this.state.player1 : this.state.player2;
    const startIndex = this.state.currentTurn === 'player1' ? 0 : 5;
    const endIndex = this.state.currentTurn === 'player1' ? 4 : 9;

    let totalStonesOnSide = 0;
    for (let i = startIndex; i <= endIndex; i++) {
      totalStonesOnSide += this.state.board[i].stones;
    }

    if (totalStonesOnSide === 0) {
      // Player must sow 1 stone to each of their 5 holes from their captured reserve
      this.state.gameLog.push(`${activePlayer.name} hết quân trên hàng dân. Phân phối lại 5 quân từ kho.`);
      activePlayer.stonesCaptured -= 5; // Can go negative if borrowing
      for (let i = startIndex; i <= endIndex; i++) {
        this.state.board[i].stones = 1;
      }
    }
  }

  // Make a move
  public async makeMove(playerKey: 'player1' | 'player2', holeIndex: number, direction: 'cw' | 'ccw'): Promise<boolean> {
    if (this.state.status !== 'playing') return false;
    if (this.state.currentTurn !== playerKey) return false;
    if (this.state.pendingQuiz !== null) return false;

    // Validate hole ownership
    const isP1 = playerKey === 'player1';
    if (isP1 && (holeIndex < 0 || holeIndex > 4)) return false;
    if (!isP1 && (holeIndex < 5 || holeIndex > 9)) return false;

    // Validate hole has stones
    if (this.state.board[holeIndex].stones === 0) return false;

    const movingPlayer = isP1 ? this.state.player1 : this.state.player2;
    this.state.gameLog.push(`${movingPlayer.name} đi từ ô ${holeIndex + 1} theo chiều ${direction === 'cw' ? 'xuôi' : 'ngược'}`);

    let hand = this.state.board[holeIndex].stones;
    this.state.board[holeIndex].stones = 0;
    let currentHole = holeIndex;

    while (hand > 0) {
      currentHole = getNextIndex(currentHole, direction);
      this.state.board[currentHole].stones += 1;
      hand -= 1;

      if (hand === 0) {
        const nextHole = getNextIndex(currentHole, direction);
        
        // Case 1: Next hole has stones and is NOT mandarin -> grab and sow again
        if (this.state.board[nextHole].stones > 0 && !this.state.board[nextHole].isMandarin) {
          hand = this.state.board[nextHole].stones;
          this.state.board[nextHole].stones = 0;
          currentHole = nextHole;
          continue;
        }
        
        // Case 2: Next hole is Mandarin -> turn ends, no sowing from it, no capture
        if (this.state.board[nextHole].isMandarin) {
          this.state.gameLog.push(`Quân cuối cùng dừng trước ô Quan (${nextHole === 10 ? 'Quan Phải' : 'Quan Trái'}). Lượt chơi kết thúc.`);
          this.switchTurn();
          break;
        }

        // Case 3: Next hole is empty -> check for capture
        if (this.state.board[nextHole].stones === 0) {
          let testEmptyHole = nextHole;
          const capturedHoles: CapturedHoleInfo[] = [];
          let totalStonesCaptured = 0;

          while (true) {
            const captureTarget = getNextIndex(testEmptyHole, direction);
            
            // If target hole has stones, capture it!
            if (this.state.board[captureTarget].stones > 0) {
              const targetStones = this.state.board[captureTarget].stones;
              const isMandarin = this.state.board[captureTarget].isMandarin;
              
              capturedHoles.push({
                index: captureTarget,
                stones: targetStones,
                isMandarin
              });

              // Add up stones value (Mandarin worth 10 normal stones, normal worth 1)
              totalStonesCaptured += isMandarin ? (targetStones - 1 + 10) : targetStones;
              
              // Temporarily empty it on board
              this.state.board[captureTarget].stones = 0;
              if (isMandarin) {
                this.state.board[captureTarget].isMandarin = false;
              }

              // Check if we can chain capture ("ăn dồn")
              const afterCapture = getNextIndex(captureTarget, direction);
              if (this.state.board[afterCapture].stones === 0) {
                testEmptyHole = afterCapture;
                // loop continues to check next hole for capture
              } else {
                break; // next hole after capture is not empty, chain ends
              }
            } else {
              break; // target is also empty (two empty holes in a row), chain ends
            }
          }

          if (capturedHoles.length > 0) {
            // Trigger Quiz
            const chapter = getChapterFromHole(capturedHoles[0].index);
            await this.triggerQuiz(isP1 ? 1 : 2, chapter, totalStonesCaptured, capturedHoles);
          } else {
            // No capture, just ended at empty hole
            this.state.gameLog.push(`Đi vào ô trống. Lượt chơi kết thúc.`);
            this.switchTurn();
          }
          break;
        }
      }
    }

    return true;
  }

  // Choose a random question for the chapter and set pendingQuiz
  private async triggerQuiz(playerIndex: 1 | 2, chapter: number, stonesCount: number, capturedHoles: CapturedHoleInfo[]) {
    try {
      const res: QueryResult = await query(
        'SELECT * FROM questions WHERE chapter = $1 ORDER BY RANDOM() LIMIT 1',
        [chapter]
      );

      if (res.rows.length > 0) {
        const q = res.rows[0];
        this.state.pendingQuiz = {
          playerIndex,
          chapter,
          questionId: q.id,
          questionContent: q.content,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          correctAnswer: q.correct_answer,
          explanation: q.explanation,
          capturedStones: stonesCount,
          capturedHoles
        };
        const pName = playerIndex === 1 ? this.state.player1.name : this.state.player2.name;
        this.state.gameLog.push(`Kích hoạt câu hỏi Lịch sử chương ${chapter} cho ${pName} để ăn ${stonesCount} quân!`);
      } else {
        // Fallback if no questions in DB
        const pState = playerIndex === 1 ? this.state.player1 : this.state.player2;
        pState.stonesCaptured += stonesCount;
        this.state.gameLog.push(`${pState.name} ăn trực tiếp ${stonesCount} quân (không có câu hỏi).`);
        this.switchTurn();
        this.checkGameOver();
      }
    } catch (err) {
      console.error('Error fetching question:', err);
      // Fallback in case of database error
      const pState = playerIndex === 1 ? this.state.player1 : this.state.player2;
      pState.stonesCaptured += stonesCount;
      this.switchTurn();
      this.checkGameOver();
    }
  }

  // Process Quiz Answer
  public processQuizAnswer(answer: string): { correct: boolean; nextTurn: 'player1' | 'player2'; explanation: string; correctAnswer: string } {
    if (!this.state.pendingQuiz) {
      return { correct: false, nextTurn: this.state.currentTurn, explanation: '', correctAnswer: '' };
    }

    const quiz = this.state.pendingQuiz;
    const isCorrect = answer.trim().toUpperCase() === quiz.correctAnswer.trim().toUpperCase();
    const activePlayer = quiz.playerIndex === 1 ? this.state.player1 : this.state.player2;

    let logMsg = '';

    if (isCorrect) {
      // Correct answer: +10 pts, get captured stones, keep turn (or get another turn)
      activePlayer.quizPoints += 10;
      activePlayer.stonesCaptured += quiz.capturedStones;
      
      // Unlock chapter
      if (!activePlayer.unlockedChapters.includes(quiz.chapter)) {
        activePlayer.unlockedChapters.push(quiz.chapter);
      }

      logMsg = `${activePlayer.name} trả lời ĐÚNG câu hỏi lịch sử: +10 điểm, thu hoạch ${quiz.capturedStones} quân và nhận thêm lượt!`;
      this.state.gameLog.push(logMsg);

      // Keep turn!
      this.state.pendingQuiz = null;
      this.checkGameOver();
      if (this.state.status === 'playing') {
        this.handleOutOfStones();
      }
    } else {
      // Incorrect answer: -5 pts, return stones to board, lose turn
      activePlayer.quizPoints = Math.max(0, activePlayer.quizPoints - 5);
      
      // Restore stones to the board
      quiz.capturedHoles.forEach((hole) => {
        this.state.board[hole.index].stones = hole.stones;
        if (hole.isMandarin) {
          this.state.board[hole.index].isMandarin = true;
        }
      });

      logMsg = `${activePlayer.name} trả lời SAI: -5 điểm. Trả lại ${quiz.capturedStones} quân về bàn cờ và mất lượt.`;
      this.state.gameLog.push(logMsg);

      // Switch turn
      this.state.pendingQuiz = null;
      this.switchTurn();
      this.checkGameOver();
    }

    return {
      correct: isCorrect,
      nextTurn: this.state.currentTurn,
      explanation: quiz.explanation,
      correctAnswer: quiz.correctAnswer
    };
  }

  private switchTurn() {
    this.state.currentTurn = this.state.currentTurn === 'player1' ? 'player2' : 'player1';
    if (this.state.status === 'playing') {
      this.handleOutOfStones();
    }
  }

  // Check Game Over
  public checkGameOver(): boolean {
    // Game over when both Mandarin holes (10 and 11) are empty (have 0 stones and are not mandarin anymore)
    // Actually, traditionally, if both Mandarins are captured, the game ends.
    const mandarinRightEmpty = this.state.board[10].stones === 0 && !this.state.board[10].isMandarin;
    const mandarinLeftEmpty = this.state.board[11].stones === 0 && !this.state.board[11].isMandarin;

    if (mandarinRightEmpty && mandarinLeftEmpty) {
      this.state.status = 'finished';
      
      // Collect remaining stones on each player's side
      let p1SideStones = 0;
      for (let i = 0; i <= 4; i++) {
        p1SideStones += this.state.board[i].stones;
        this.state.board[i].stones = 0;
      }

      let p2SideStones = 0;
      for (let i = 5; i <= 9; i++) {
        p2SideStones += this.state.board[i].stones;
        this.state.board[i].stones = 0;
      }

      this.state.player1.stonesCaptured += p1SideStones;
      this.state.player2.stonesCaptured += p2SideStones;

      this.state.gameLog.push(`Cả hai ô Quan đã hết. Thu hoạch quân còn lại trên bàn: ${this.state.player1.name} thu thêm ${p1SideStones} quân, ${this.state.player2.name} thu thêm ${p2SideStones} quân.`);

      // Calculate final score = stonesCaptured + quizPoints
      const p1Final = this.state.player1.stonesCaptured + this.state.player1.quizPoints;
      const p2Final = this.state.player2.stonesCaptured + this.state.player2.quizPoints;

      let winner: 'player1' | 'player2' | 'draw' = 'draw';
      if (p1Final > p2Final) {
        winner = 'player1';
        this.state.winnerId = this.state.player1.id;
        this.state.winnerName = this.state.player1.name;
      } else if (p2Final > p1Final) {
        winner = 'player2';
        this.state.winnerId = this.state.player2.id;
        this.state.winnerName = this.state.player2.name;
      }

      if (winner === 'draw') {
        this.state.gameLog.push(`Kết quả: Hòa! Cả hai đạt ${p1Final} điểm.`);
      } else {
        const wName = winner === 'player1' ? this.state.player1.name : this.state.player2.name;
        this.state.gameLog.push(`Trận đấu kết thúc! Người chiến thắng là ${wName} (${p1Final} vs ${p2Final} điểm).`);
      }

      return true;
    }

    return false;
  }
}
