import { IQuestion } from './app';
import { IQuiz } from './models/Quiz';

interface IUserAnswer {
  question_id: string;
  answer: string;
}

interface IRoomUser {
  id: string;
  name: string;
  points: number;
  answers: {
    [key: string]: IUserAnswer;
  };
}

interface IRoomGame {
  expectedAnswer: string;
  started: boolean;
  currentQuestionId: string;
  currentQuestion: IQuestion | null;
  questionIdx: number;
  questionAnsweredBy: string[];
  onlineUsers: string[];
  quiz: IQuiz;
  users: {
    [key: string]: IRoomUser;
  };
}

interface IGames {
  [key: string]: IRoomGame;
}

interface IStartGame {
  gameId: string;
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
  isHost: boolean;
  currentQuestion: IQuestion | null;
  questionIdx: number;
  quiz: IQuiz;
}

const games: IGames = {};

const getCurrentGame = (gameId: string) => {
  if (games[gameId]) {
    return games[gameId];
  }
  return null;
};

const joinGame = ({ userId, gameId, username, isHost }: IJoinGame) => {
  if (games[gameId] && !games[gameId].users[userId]) {
    games[gameId].users[userId] = {
      id: userId,
      name: username,
      points: 0,
      answers: {},
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

const createGame = ({ userId, gameId, username, isHost, quiz }: ICreateGame) => {
  if (!games[gameId]) {
    games[gameId] = {
      users: {},
      expectedAnswer: '',
      started: false,
      currentQuestion: null,
      questionAnsweredBy: [],
      currentQuestionId: '',
      onlineUsers: [],
      questionIdx: 0,
      quiz: quiz,
    };
  }

  if (games[gameId] && isHost) {
    games[gameId].quiz = quiz;
  }
  joinGame({ userId, gameId, username, isHost });
};

const startGame = ({ gameId }: IStartGame) => {
  if (games[gameId] && games[gameId].quiz) {
    const question = games[gameId].quiz.questions[games[gameId].questionIdx];

    games[gameId].currentQuestion = question;
    games[gameId].expectedAnswer = question.correct_answer;
    games[gameId].currentQuestionId = question._id;
    games[gameId].started = true;
    games[gameId].questionAnsweredBy = [];
  }
};

const onNextQuestion = ({ gameId }: IStartGame) => {
  if (games[gameId]) {
    const newQuestionIdx = games[gameId].questionIdx + 1;

    const newQuestion = games[gameId].quiz.questions[newQuestionIdx];

    games[gameId].expectedAnswer = newQuestion.correct_answer;
    games[gameId].currentQuestion = newQuestion;
    games[gameId].currentQuestionId = newQuestion._id;
    games[gameId].questionAnsweredBy = [];
    games[gameId].questionIdx = newQuestionIdx;
  }
};

const addAnswer = ({ gameId, userId, answerValue }: IAddAnswer) => {
  games[gameId].users[userId].points =
    games[gameId].users[userId].points + (answerValue === games[gameId].expectedAnswer ? 1 : 0);

  games[gameId].questionAnsweredBy.push(userId);

  games[gameId].users[userId].answers[games[gameId].currentQuestionId] = {
    question_id: games[gameId].currentQuestionId,
    answer: answerValue,
  };
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
  return [];
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
