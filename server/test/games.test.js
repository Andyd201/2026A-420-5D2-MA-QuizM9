/**
 * Tests d'INTÉGRATION de la salle de jeu : rejoindre une partie.
 *
 * La salle de jeu se protège déjà (voir app.js) : rejoindre deux fois la
 * même partie avec le même pseudonyme, ou rejoindre une partie commencée,
 * répond 400 dans les deux cas. Rien à corriger ici : ces tests prouvent un
 * comportement qui existe déjà.
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer } from './helpers.js';

let api;
before(async () => {
  api = await startServer();
});
after(() => api.close());

/** Crée un questionnaire avec une question, et retourne son id. */
async function createQuizWithQuestion() {
  const { data: quiz } = await api.request('POST', '/api/quizzes', { title: 'Capitales' });
  await api.request('POST', `/api/quizzes/${quiz.id}/questions`, {
    text: 'La capitale du Québec ?',
    durationSeconds: 20,
    choices: [
      { text: 'Montréal', isCorrect: false },
      { text: 'Québec', isCorrect: true },
    ],
  });
  return quiz.id;
}

test('rejoindre deux fois la même partie avec le même pseudonyme est refusé (400)', async () => {
  const quizId = await createQuizWithQuestion();
  const { data: game } = await api.request('POST', '/api/games', { quizId });

  const first = await api.request('POST', `/api/games/${game.code}/players`, { nickname: 'Ada' });
  assert.equal(first.status, 201);

  const second = await api.request('POST', `/api/games/${game.code}/players`, { nickname: 'Ada' });
  assert.equal(second.status, 400);
  assert.equal(typeof second.data.error, 'string');
});

test('rejoindre une partie commencée est refusé (400)', async () => {
  const quizId = await createQuizWithQuestion();
  const { data: game } = await api.request('POST', '/api/games', { quizId });

  // L'animateur démarre la partie : lobby → question.
  await api.request('POST', `/api/games/${game.code}/next`, {});

  const { status, data } = await api.request('POST', `/api/games/${game.code}/players`, {
    nickname: 'Ada',
  });
  assert.equal(status, 400);
  assert.equal(typeof data.error, 'string');
});
