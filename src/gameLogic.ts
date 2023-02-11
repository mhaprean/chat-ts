import { IQuestion } from './app';

interface IRoomUser {
  id: string;
  name: string;
  points: number;
}

interface IGame {
  expectedAnswer: string;
  started: boolean;
  currentQuestion: IQuestion | null;
  questionIdx: number;
  onlineUsers: string[];
  users: {
    [key: string]: IRoomUser;
  };
}

interface IGames {
  [key: string]: IGame;
}

interface IStartGame {
  gameId: string;
  expectedAnswer: string;
  question: IQuestion;
  questionIdx: number;
}

interface IEndGame {
  gameId: string;
}

interface IAddAnswer {
  gameId: string;
  userId: string;
  answerValue: string;
}

interface IJoinGame {
  userId: string;
  username: string;
  gameId: string;
  isHost: boolean;
}

interface ICreateGame {
  userId: string;
  username: string;
  gameId: string;
  currentQuestion: IQuestion | null;
  questionIdx: number;
}

const games: IGames = {};

const getCurrentGame = (gameId: string) => {
  if (games[gameId]) {
    return games[gameId];
  }
};

const joinGame = ({ userId, gameId, username }: IJoinGame) => {
  if (!games[gameId].users[userId]) {
    games[gameId].users[userId] = {
      id: userId,
      name: username,
      points: 0,
    };
  }

  if (games[gameId] && !games[gameId].onlineUsers.includes(userId)) {
    games[gameId].onlineUsers = [...games[gameId].onlineUsers, userId];
  }
};

const leaveGame = ({ userId, gameId, username }: IJoinGame) => {
  if (games[gameId] && games[gameId].onlineUsers.includes(userId)) {
    games[gameId].onlineUsers = games[gameId].onlineUsers.filter((user, idx) => user !== userId);
  }
};

const createGame = ({ userId, gameId, username }: ICreateGame) => {
  if (!games[gameId]) {
    games[gameId] = {
      users: {},
      expectedAnswer: '',
      started: false,
      currentQuestion: null,
      onlineUsers: [],
      questionIdx: 0,
    };
  }
  const isHost = false;
  joinGame({ userId, gameId, username, isHost });
};

const startGame = ({ gameId, expectedAnswer, question }: IStartGame) => {
  if (games[gameId]) {
    games[gameId].expectedAnswer = expectedAnswer;
    games[gameId].currentQuestion = question;
    games[gameId].started = true;
  }
};

const onNextQuestion = ({ gameId, expectedAnswer, question }: IStartGame) => {
  if (games[gameId]) {
    games[gameId].expectedAnswer = expectedAnswer;
    games[gameId].currentQuestion = question;
  }
};

const addAnswer = ({ gameId, userId, answerValue }: IAddAnswer) => {
  games[gameId].users[userId].points =
    games[gameId].users[userId].points + (answerValue === games[gameId].expectedAnswer ? 1 : 0);
};

const deleteGame = ({ gameId }: IEndGame) => {
  delete games[gameId];
};

const getGameUsers = (gameId: string) => {
  if (games[gameId] && games[gameId].users) {
    return games[gameId].users;
  }
  return {};
};

const getGameOnlineUsers = (gameId: string) => {
  if (games[gameId] && games[gameId].onlineUsers) {
    return games[gameId].onlineUsers;
  }
  return {};
};

const gameModule = {
  createGame,
  joinGame,
  leaveGame,
  startGame,
  onNextQuestion,
  addAnswer,
  getGameUsers,
  deleteGame,
  getCurrentGame,
  getGameOnlineUsers,
};

export default gameModule;
