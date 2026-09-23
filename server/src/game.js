/**
<<<<<<< HEAD
 * Le moteur de jeu, version semaine 2 : l'état des parties vit DANS LA BASE.
 *
 * Plus aucune Map en mémoire. Une partie est une ligne de la table game,
 * relue à chaque requête ; ses joueurs et leurs réponses sont des lignes de
 * player et answer. On peut redémarrer le serveur en pleine partie : rien
 * n'est perdu.
 *
 * Le moteur ne fait aucun SQL lui-même : il passe par repository/. C'est la
 * règle de la semaine, et elle paiera à la semaine 5 (PostgreSQL).
=======
 * Le moteur de jeu : l'état des parties vit DANS LA BASE.
 *
 * Une partie est une ligne de la table game, relue à chaque requête ; ses
 * joueurs et leurs réponses sont des lignes de player et answer. On peut
 * redémarrer le serveur en pleine partie : rien n'est perdu.
 *
 * Le moteur ne fait aucun SQL lui-même : il passe par repository/. Depuis la
 * semaine 5, chaque appel au repository est une promesse : `await` partout.
>>>>>>> upstream/main
 *
 * Machine à états d'une partie (colonne game.state) :
 *   'lobby' → 'question' ⇄ 'results' → 'finished'
 */
import { calculateScore } from './scoring.js';
import * as repository from './repository/index.js';

/** Un code de partie à six chiffres, unique parmi les parties existantes. */
<<<<<<< HEAD
function generateCode() {
  let code;
  do {
    code = String(Math.floor(100000 + Math.random() * 900000));
  } while (repository.findGameByCode(code));
=======
async function generateCode() {
  let code;
  do {
    code = String(Math.floor(100000 + Math.random() * 900000));
  } while (await repository.findGameByCode(code));
>>>>>>> upstream/main
  return code;
}

/** Crée une partie sur ce questionnaire et retourne sa ligne game. */
<<<<<<< HEAD
export function createGame(quizId) {
  const code = generateCode();
  repository.createGame(quizId, code, Date.now());
  return repository.findGameByCode(code);
}

/** La question courante d'une partie, ou null hors d'une question. */
export function currentQuestion(game) {
  const quiz = repository.getQuizWithQuestions(game.quiz_id);
  return quiz.questions[game.question_index] ?? null;
}

=======
export async function createGame(quizId) {
  const code = await generateCode();
  await repository.createGame(quizId, code, Date.now());
  return repository.findGameByCode(code);
}

/** La question courante d'une partie, ou null hors d'une question. */
export async function currentQuestion(game) {
  const quiz = await repository.getQuizWithQuestions(game.quiz_id);
  return quiz.questions[game.question_index] ?? null;
}

>>>>>>> upstream/main
/** L'échéance de la question courante (horodatage serveur, en ms). */
function deadlineOf(game, question) {
  return game.question_started_at + question.durationSeconds * 1000;
}

/**
 * Clôt la question courante : calcule le pointage de chaque réponse reçue
 * et l'ajoute au total du joueur. Le bonus de la première bonne réponse va à
 * la première bonne réponse dans l'ordre d'arrivée (horloge du serveur).
 *
<<<<<<< HEAD
 * Trois écritures qui doivent réussir ensemble — les points de chaque
 * réponse, les totaux des joueurs, l'état de la partie — donc une
 * transaction.
=======
 * Trois écritures qui doivent réussir ensemble (les points de chaque
 * réponse, les totaux des joueurs, l'état de la partie), donc une
 * transaction : toutes passent par la connexion `tx` qu'elle a empruntée.
>>>>>>> upstream/main
 */
export async function closeQuestion(game) {
  if (game.state !== 'question') return;
<<<<<<< HEAD
  const question = currentQuestion(game);
=======
  const question = await currentQuestion(game);
>>>>>>> upstream/main
  const correctChoices = new Set(
    question.choices.filter((c) => c.isCorrect).map((c) => c.id),
  );
  const questionDurationMs = question.durationSeconds * 1000;
<<<<<<< HEAD
  const answers = repository.getAnswersForQuestion(game.id, question.id);

  repository.withTransaction(() => {
=======
  const answers = await repository.getAnswersForQuestion(game.id, question.id);

  await repository.withTransaction(async (tx) => {
>>>>>>> upstream/main
    let firstAwarded = false;
    for (const answer of answers) {
      const responseTimeMs = answer.answered_at - game.question_started_at;
      const isCorrect = correctChoices.has(answer.choice_id);
      const isFirstCorrectAnswer =
        isCorrect && responseTimeMs <= questionDurationMs && !firstAwarded;
      if (isFirstCorrectAnswer) firstAwarded = true;

      const points = calculateScore({
        isCorrect,
        responseTimeMs,
        questionDurationMs,
        isFirstCorrectAnswer,
      });
<<<<<<< HEAD
      repository.setAnswerPoints(answer.id, points);
      repository.addPointsToPlayer(answer.player_id, points);
    }
    repository.updateGameState(game.id, 'results', game.question_index, null);
=======
      await repository.setAnswerPoints(answer.id, points, tx);
      await repository.addPointsToPlayer(answer.player_id, points, tx);
    }
    await repository.updateGameState(game.id, 'results', game.question_index, null, tx);
>>>>>>> upstream/main
  });
  game.state = 'results';
  game.question_started_at = null;
}

/** Clôt la question courante si son échéance est passée. */
<<<<<<< HEAD
export function closeQuestionIfExpired(game) {
  if (game.state === 'question' && Date.now() > deadlineOf(game, currentQuestion(game))) {
    closeQuestion(game);
=======
export async function closeQuestionIfExpired(game) {
  if (game.state !== 'question') return;
  const question = await currentQuestion(game);
  if (Date.now() > deadlineOf(game, question)) {
    await closeQuestion(game);
>>>>>>> upstream/main
  }
}

/** Passe à la question suivante, ou termine la partie s'il n'y en a plus. */
export async function advance(game) {
  if (game.state === 'finished') return;
<<<<<<< HEAD
  const quiz = repository.getQuizWithQuestions(game.quiz_id);
  if (game.question_index + 1 >= quiz.questions.length) {
    repository.updateGameState(game.id, 'finished', game.question_index, null);
    return;
  }
  repository.updateGameState(game.id, 'question', game.question_index + 1, Date.now());
=======
  const quiz = await repository.getQuizWithQuestions(game.quiz_id);
  if (game.question_index + 1 >= quiz.questions.length) {
    await repository.updateGameState(game.id, 'finished', game.question_index, null);
    return;
  }
  await repository.updateGameState(game.id, 'question', game.question_index + 1, Date.now());
>>>>>>> upstream/main
}

/**
 * L'état visible par les clients, relu au complet dans la base. Les choix
 * sont transmis SANS is_correct : le serveur ne dit jamais au navigateur où
 * est la bonne réponse.
 */
<<<<<<< HEAD
export function publicState(code) {
  const game = repository.findGameByCode(code);
  const quiz = repository.getQuizWithQuestions(game.quiz_id);
  const question = game.state === 'question' ? quiz.questions[game.question_index] : null;
=======
export async function publicState(code) {
  const game = await repository.findGameByCode(code);
  const quiz = await repository.getQuizWithQuestions(game.quiz_id);
  const question = game.state === 'question' ? quiz.questions[game.question_index] : null;
  const players = await repository.getPlayers(game.id);
>>>>>>> upstream/main
  return {
    code: game.code,
    state: game.state,
    questionIndex: game.question_index,
    questionCount: quiz.questions.length,
    title: quiz.title,
    question: question && {
      text: question.text,
      deadline: deadlineOf(game, question),
      choices: question.choices.map((c) => ({ id: c.id, text: c.text })),
    },
<<<<<<< HEAD
    players: repository
      .getPlayers(game.id)
      .map((p) => ({ nickname: p.nickname, score: p.score })),
    answerCount: question ? repository.countAnswers(game.id, question.id) : 0,
=======
    players: players.map((p) => ({ nickname: p.nickname, score: p.score })),
    answerCount: question ? await repository.countAnswers(game.id, question.id) : 0,
>>>>>>> upstream/main
  };
}
