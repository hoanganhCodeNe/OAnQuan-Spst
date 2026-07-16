import { Server, Socket } from 'socket.io';
import { MatchEngine, MatchState } from '../services/gameEngine';
import { AIEngine } from '../services/ai';
import { saveMatchResult } from '../controllers/matchController';

interface PlayerSocket {
  id: string;
  name: string;
  socketId: string;
}

interface Room {
  roomCode: string;
  mode: 'pvp' | 'ai_easy' | 'ai_medium' | 'ai_hard';
  host: PlayerSocket;
  guest?: PlayerSocket;
  status: 'waiting' | 'playing' | 'finished';
  matchId?: string;
}

// In-memory storage for rooms and matches
const rooms = new Map<string, Room>();
const activeMatches = new Map<string, MatchEngine>();
const playerSocketMap = new Map<string, { roomCode: string; playerId: string }>();

// Generate 6-character room code
const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  do {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (rooms.has(code));
  return code;
};

export const setupGameSockets = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // --- CREATE PVP ROOM ---
    socket.on('create_room', (data: { userId: string; userName: string }) => {
      const { userId, userName } = data;
      const roomCode = generateRoomCode();

      const newRoom: Room = {
        roomCode,
        mode: 'pvp',
        host: { id: userId, name: userName, socketId: socket.id },
        status: 'waiting',
      };

      rooms.set(roomCode, newRoom);
      playerSocketMap.set(socket.id, { roomCode, playerId: userId });
      socket.join(roomCode);

      socket.emit('room_created', { roomCode, room: newRoom });
      console.log(`Room created: ${roomCode} by ${userName}`);
    });

    // --- JOIN PVP ROOM ---
    socket.on('join_room', (data: { roomCode: string; userId: string; userName: string }) => {
      const { roomCode, userId, userName } = data;
      const upperCode = roomCode.trim().toUpperCase();
      const room = rooms.get(upperCode);

      if (!room) {
        return socket.emit('error_message', { message: 'Phòng không tồn tại.' });
      }

      if (room.mode !== 'pvp') {
        return socket.emit('error_message', { message: 'Đây không phải là phòng đấu đối kháng.' });
      }

      if (room.status !== 'waiting') {
        return socket.emit('error_message', { message: 'Trận đấu trong phòng này đã bắt đầu.' });
      }

      if (room.guest) {
        return socket.emit('error_message', { message: 'Phòng đã đầy.' });
      }

      // Join guest
      room.guest = { id: userId, name: userName, socketId: socket.id };
      playerSocketMap.set(socket.id, { roomCode: upperCode, playerId: userId });
      socket.join(upperCode);

      io.to(upperCode).emit('room_joined', { roomCode: upperCode, room });
      console.log(`Player ${userName} joined room: ${upperCode}`);
    });

    // --- LEAVE ROOM (IN WAITING LOBBY) ---
    socket.on('leave_room', (data: { roomCode: string }) => {
      const { roomCode } = data;
      const upperCode = roomCode.trim().toUpperCase();
      const room = rooms.get(upperCode);

      if (!room) return;

      const isHost = socket.id === room.host.socketId;

      if (isHost) {
        io.to(upperCode).emit('room_dissolved', { message: 'Chủ phòng đã hủy sảnh chờ.' });
        rooms.delete(upperCode);
        console.log(`Room dissolved: ${upperCode} by Host`);
      } else {
        room.guest = undefined;
        io.to(upperCode).emit('room_joined', { roomCode: upperCode, room });
        console.log(`Guest left room: ${upperCode}`);
      }

      socket.leave(upperCode);
      playerSocketMap.delete(socket.id);
    });

    // --- CREATE VS AI ROOM ---
    socket.on('create_ai_room', async (data: { mode: 'ai_easy' | 'ai_medium' | 'ai_hard'; userId: string; userName: string }) => {
      const { mode, userId, userName } = data;
      const roomCode = generateRoomCode();

      let botName = 'Máy Dễ';
      if (mode === 'ai_medium') botName = 'Máy Vừa';
      if (mode === 'ai_hard') botName = 'Máy Khó';

      const botId = '00000000-0000-0000-0000-000000000000'; // Special bot UUID

      const newRoom: Room = {
        roomCode,
        mode,
        host: { id: userId, name: userName, socketId: socket.id },
        guest: { id: botId, name: botName, socketId: 'ai_socket' },
        status: 'playing',
        matchId: roomCode, // matchId matches roomCode for simplicity
      };

      rooms.set(roomCode, newRoom);
      playerSocketMap.set(socket.id, { roomCode, playerId: userId });
      socket.join(roomCode);

      // Create AI Match Engine
      const match = new MatchEngine(roomCode, mode, userId, userName, botId, botName);
      activeMatches.set(roomCode, match);

      socket.emit('room_created', { roomCode, room: newRoom });
      io.to(roomCode).emit('game_state', match.state);
      console.log(`AI Match started: ${roomCode} (${mode}) for ${userName}`);
    });

    // --- START GAME (PVP) ---
    socket.on('start_game', (data: { roomCode: string }) => {
      const { roomCode } = data;
      const upperCode = roomCode.trim().toUpperCase();
      const room = rooms.get(upperCode);

      if (!room || room.status !== 'waiting' || !room.guest) {
        return socket.emit('error_message', { message: 'Không thể khởi động game.' });
      }

      // Check if caller is host
      if (room.host.socketId !== socket.id) {
        return socket.emit('error_message', { message: 'Chỉ chủ phòng mới có thể bắt đầu trận đấu.' });
      }

      room.status = 'playing';
      room.matchId = upperCode;

      const match = new MatchEngine(upperCode, 'pvp', room.host.id, room.host.name, room.guest.id, room.guest.name);
      activeMatches.set(upperCode, match);

      io.to(upperCode).emit('game_state', match.state);
      console.log(`PVP Match started: ${upperCode}`);
    });

    // --- MAKE MOVE ---
    socket.on('make_move', async (data: { roomCode: string; holeIndex: number; direction: 'cw' | 'ccw' }) => {
      const { roomCode, holeIndex, direction } = data;
      const upperCode = roomCode.trim().toUpperCase();
      const room = rooms.get(upperCode);
      const match = activeMatches.get(upperCode);

      if (!room || !match) {
        return socket.emit('error_message', { message: 'Không tìm thấy trận đấu.' });
      }

      // Identify player key
      const playerKey = socket.id === room.host.socketId ? 'player1' : 'player2';

      const success = await match.makeMove(playerKey, holeIndex, direction);
      if (!success) {
        return socket.emit('error_message', { message: 'Lượt đi không hợp lệ.' });
      }

      // Sync state to all
      io.to(upperCode).emit('game_state', match.state);

      // Handle AI Turn if match mode is AI and it's AI's turn
      if (match.state.status === 'playing' && match.state.currentTurn === 'player2' && room.mode !== 'pvp') {
        await handleAITurn(io, upperCode, match);
      }

      // Handle Game finished
      if (match.state.status === 'finished') {
        await finalizeMatch(io, upperCode, match, room);
      }
    });

    // --- SUBMIT ANSWER ---
    socket.on('submit_answer', async (data: { roomCode: string; answer: string }) => {
      const { roomCode, answer } = data;
      const upperCode = roomCode.trim().toUpperCase();
      const room = rooms.get(upperCode);
      const match = activeMatches.get(upperCode);

      if (!room || !match || !match.state.pendingQuiz) {
        return socket.emit('error_message', { message: 'Không tìm thấy lượt trả lời hợp lệ.' });
      }

      const activeQuiz = match.state.pendingQuiz;
      const activePlayerKey = activeQuiz.playerIndex === 1 ? 'player1' : 'player2';

      // Check if answering socket matches the active player
      const activeSocketId = activePlayerKey === 'player1' ? room.host.socketId : room.guest?.socketId;
      if (socket.id !== activeSocketId) {
        return socket.emit('error_message', { message: 'Không phải lượt trả lời của bạn.' });
      }

      const result = match.processQuizAnswer(answer);

      // Broadcast quiz result
      io.to(upperCode).emit('quiz_result', {
        correct: result.correct,
        correctAnswer: result.correctAnswer,
        explanation: result.explanation,
        nextTurn: result.nextTurn,
      });

      // Broadcast updated board state
      io.to(upperCode).emit('game_state', match.state);

      // Trigger AI turn if it is now AI's turn
      if (match.state.status === 'playing' && match.state.currentTurn === 'player2' && room.mode !== 'pvp') {
        await handleAITurn(io, upperCode, match);
      }

      // Save match if finished
      if (match.state.status === 'finished') {
        await finalizeMatch(io, upperCode, match, room);
      }
    });

    // --- REALTIME CHAT ---
    socket.on('chat_message', (data: { roomCode: string; message: string; senderName: string }) => {
      const { roomCode, message, senderName } = data;
      const upperCode = roomCode.trim().toUpperCase();
      
      io.to(upperCode).emit('chat_received', {
        sender: senderName,
        message,
        timestamp: Date.now()
      });
    });

    // --- SURRENDER (GG) ---
    socket.on('surrender', async (data: { roomCode: string }) => {
      const { roomCode } = data;
      const upperCode = roomCode.trim().toUpperCase();
      const room = rooms.get(upperCode);
      const match = activeMatches.get(upperCode);

      if (!room || !match || match.state.status !== 'playing') {
        return socket.emit('error_message', { message: 'Không thể đầu hàng lúc này.' });
      }

      const isHost = socket.id === room.host.socketId;
      const surrenderingPlayerName = isHost ? room.host.name : (room.guest?.name || 'Đối thủ');
      
      match.state.status = 'finished';
      match.state.gameLog.push(`${surrenderingPlayerName} đã đầu hàng (GG). Trận đấu kết thúc.`);

      if (isHost) {
        match.state.winnerId = room.guest?.id || null;
        match.state.winnerName = room.guest?.name || null;
      } else {
        match.state.winnerId = room.host.id;
        match.state.winnerName = room.host.name;
      }

      await finalizeMatch(io, upperCode, match, room);
      console.log(`Player surrendered in room ${upperCode}. Winner: ${match.state.winnerName}`);
    });

    // --- RECONNECT ---
    socket.on('reconnect_match', (data: { roomCode: string; userId: string }) => {
      const { roomCode, userId } = data;
      const upperCode = roomCode.trim().toUpperCase();
      const room = rooms.get(upperCode);
      const match = activeMatches.get(upperCode);

      if (room) {
        // Update socket ID mapping
        if (room.host.id === userId) {
          room.host.socketId = socket.id;
        } else if (room.guest && room.guest.id === userId) {
          room.guest.socketId = socket.id;
        }

        playerSocketMap.set(socket.id, { roomCode: upperCode, playerId: userId });
        socket.join(upperCode);

        socket.emit('reconnect_success', { room, gameState: match ? match.state : null });
        io.to(upperCode).emit('chat_received', {
          sender: 'Hệ thống',
          message: `${room.host.id === userId ? room.host.name : room.guest?.name} đã kết nối lại.`,
          timestamp: Date.now()
        });
        console.log(`Reconnected player ${userId} to room ${upperCode}`);
      } else {
        socket.emit('reconnect_failed', { message: 'Không thể kết nối lại. Trận đấu có thể đã kết thúc.' });
      }
    });

    // --- DISCONNECT ---
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      const mapping = playerSocketMap.get(socket.id);
      
      if (mapping) {
        const { roomCode, playerId } = mapping;
        const room = rooms.get(roomCode);
        
        if (room) {
          const isHost = socket.id === room.host.socketId;
          const isGuest = room.guest && socket.id === room.guest.socketId;

          // If the game has not started yet (waiting in lobby), clean up immediately
          if (room.status === 'waiting') {
            if (isHost) {
              io.to(roomCode).emit('room_dissolved', { message: 'Chủ phòng đã thoát. Sảnh chờ bị hủy.' });
              rooms.delete(roomCode);
              console.log(`Waiting room dissolved immediately due to host disconnect: ${roomCode}`);
            } else if (isGuest) {
              room.guest = undefined;
              io.to(roomCode).emit('room_joined', { roomCode, room });
              console.log(`Guest removed from waiting room immediately due to disconnect: ${roomCode}`);
            }
            playerSocketMap.delete(socket.id);
            return;
          }

          // If game is active (playing), standard 60s reconnection timeout
          const playerName = room.host.id === playerId ? room.host.name : room.guest?.name || 'Đối thủ';
          io.to(roomCode).emit('player_disconnected', { playerId, message: `${playerName} bị mất kết nối.` });
          io.to(roomCode).emit('chat_received', {
            sender: 'Hệ thống',
            message: `${playerName} đã mất kết nối. Đang chờ 60 giây để kết nối lại...`,
            timestamp: Date.now()
          });

          setTimeout(() => {
            const currentRoom = rooms.get(roomCode);
            if (currentRoom) {
              const hostDisconnected = currentRoom.host.socketId === socket.id;
              const guestDisconnected = currentRoom.guest?.socketId === socket.id;

              if ((hostDisconnected && currentRoom.host.socketId === socket.id) || 
                  (guestDisconnected && currentRoom.guest?.socketId === socket.id)) {
                
                const activeMatch = activeMatches.get(roomCode);
                if (activeMatch && activeMatch.state.status === 'playing') {
                  activeMatch.state.status = 'finished';
                  activeMatch.state.gameLog.push(`${playerName} rời trận đấu quá lâu. Trận đấu kết thúc do bỏ cuộc.`);
                  
                  if (currentRoom.host.id === playerId) {
                    activeMatch.state.winnerId = currentRoom.guest?.id || null;
                    activeMatch.state.winnerName = currentRoom.guest?.name || null;
                  } else {
                    activeMatch.state.winnerId = currentRoom.host.id;
                    activeMatch.state.winnerName = currentRoom.host.name;
                  }

                  finalizeMatch(io, roomCode, activeMatch, currentRoom);
                }

                rooms.delete(roomCode);
                activeMatches.delete(roomCode);
                console.log(`Cleaned up room: ${roomCode} due to disconnect timeout`);
              }
            }
          }, 60000);
        }
        playerSocketMap.delete(socket.id);
      }
    });
  });
};

// Helper: Handle AI Sowing and Quiz Answering
const handleAITurn = async (io: Server, roomCode: string, match: MatchEngine) => {
  // 1. Calculate AI Move
  const aiMove = AIEngine.calculateMove(match.state);
  
  // 2. Wait 1.5 seconds to simulate thinking
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // 3. Execute AI Move
  const success = await match.makeMove('player2', aiMove.holeIndex, aiMove.direction);
  if (!success) return;

  // Broadcast game state after move
  io.to(roomCode).emit('game_state', match.state);

  // 4. If AI triggered a quiz, simulate answering it
  if (match.state.pendingQuiz) {
    const quiz = match.state.pendingQuiz;
    
    // Wait 3 seconds simulating reading and choosing answer
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const willAnswerCorrect = AIEngine.simulateQuizAnswer(match.state.mode);
    const answer = willAnswerCorrect ? quiz.correctAnswer : getWrongOption(quiz.correctAnswer);
    
    const result = match.processQuizAnswer(answer);

    // Broadcast quiz result
    io.to(roomCode).emit('quiz_result', {
      correct: result.correct,
      correctAnswer: result.correctAnswer,
      explanation: result.explanation,
      nextTurn: result.nextTurn,
    });

    // Broadcast updated board state
    io.to(roomCode).emit('game_state', match.state);

    // If turn is still player2 (AI got extra turn), loop again recursively!
    if (match.state.status === 'playing' && match.state.currentTurn === 'player2') {
      await handleAITurn(io, roomCode, match);
    }
  }
};

const getWrongOption = (correct: string): string => {
  const options = ['A', 'B', 'C', 'D'].filter(o => o !== correct);
  return options[Math.floor(Math.random() * options.length)];
};

// Helper: Save Finished Match results to Postgres and broadcast to players
const finalizeMatch = async (io: Server, roomCode: string, match: MatchEngine, room: Room) => {
  console.log(`Finalizing match for room ${roomCode}`);
  
  // Save match in DB in the background (do not await to prevent blocking game finalization)
  const isPvp = room.mode === 'pvp';
  const player2Id = isPvp ? (room.guest?.id || null) : '00000000-0000-0000-0000-000000000000';

  saveMatchResult({
    player1Id: room.host.id,
    player2Id,
    player1Name: room.host.name,
    player2Name: room.guest?.name || 'Máy',
    winnerId: match.state.winnerId,
    winnerName: match.state.winnerName,
    mode: room.mode,
    p1Score: match.state.player1.stonesCaptured + match.state.player1.quizPoints,
    p2Score: match.state.player2.stonesCaptured + match.state.player2.quizPoints,
  }).catch((err) => {
    console.error('Error saving match result in background:', err);
  });

  // Notify clients match finished immediately
  io.to(roomCode).emit('match_finished', {
    winnerId: match.state.winnerId,
    winnerName: match.state.winnerName,
    gameState: match.state
  });
};
