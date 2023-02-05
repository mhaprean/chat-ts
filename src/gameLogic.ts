import { IQuestion } from './app';

interface IUser {
  id: string;
  name: string;
  points: number;
}

interface IGame {
  expectedAnswer: string;
  started: boolean;
  currentQuestion: IQuestion | null;
  users: {
    [key: string]: IUser;
  };
}

interface IGames {
  [key: string]: IGame;
}

interface IStartGame {
  gameId: string;
  expectedAnswer: string;
  question: IQuestion;
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
}

interface ICreateGame {
  userId: string;
  username: string;
  gameId: string;
  currentQuestion: IQuestion | null;
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
};

const createGame = ({ userId, gameId, username }: ICreateGame) => {
  if (!games[gameId]) {
    games[gameId] = {
      users: {},
      expectedAnswer: '',
      started: false,
      currentQuestion: null,
    };
  }

  joinGame({ userId, gameId, username });
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

const deleteGame = ({ gameId }: IStartGame) => {
  delete games[gameId];
};

const getGameUsers = (gameId: string) => {
  return games[gameId].users;
};

const gameModule = {
  createGame,
  joinGame,
  startGame,
  onNextQuestion,
  addAnswer,
  getGameUsers,
  deleteGame,
  getCurrentGame,
};

export default gameModule;
