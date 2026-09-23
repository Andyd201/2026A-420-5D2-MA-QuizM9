# Quiz M9

Le fil rouge du cours 420-5D2. Un jeu-questionnaire en direct : un animateur
crée une partie et obtient un **code** ; les joueurs rejoignent avec ce code et
un pseudonyme, sans compte ; les questions défilent, le classement monte. Les
auteurs, eux, se connectent avec GitHub pour écrire leurs questionnaires.

Le dépôt grandit d'une semaine à l'autre. **L'énoncé du travail de la semaine
est sur le site du cours**, sous
[Exercices](https://archambaultv.github.io/2026A-420-5D2-MA/g2/notes_de_cours/exercices).

## Prérequis

- Node.js **LTS** (24 ou plus récent) ;
- **Docker Desktop**, démarré : la base de données tourne dans un conteneur
  (sans Docker, voir [Sans Docker](#sans-docker)) ;
- deux navigateurs, ou une fenêtre normale et une fenêtre privée, pour jouer
  à la fois animateur et joueur ;
- sous Windows : clonez **hors d'un dossier synchronisé OneDrive**
  (Documents, Bureau…), la synchronisation interfère avec `node --watch` et
  Vite.

## Démarrer

```bash
npm install                      # installe server/ et client/ d'un coup
docker compose up -d postgres    # la base de données, en arrière-plan
npm run dev                      # le serveur (port 3000) et le client (port 5173)
```

Ouvrez <http://localhost:5173>.

<<<<<<< HEAD
## Vérifier

```bash
npm run verifier   # avec npm run dev qui tourne dans un autre terminal
```

## Tester (semaine 4)

```bash
npm test           # sans npm run dev : les tests démarrent l'API eux-mêmes
```

Les tests sont dans `server/test/`. Ceux de `calculateScore` sont unitaires
(pas de serveur) ; ceux de l'API démarrent `app.js` sur un port libre avec
une base temporaire.

## Intégration continue et images (semaine 4)
=======
Pour « Se connecter avec GitHub », copiez `server/.env.example` en
`server/.env` et remplissez-le : les valeurs viennent de l'application OAuth
que vous créez sur GitHub (voir l'exercice 11).

## Tester

```bash
npm test        # PostgreSQL doit tourner : docker compose up -d postgres
```

## Sans Docker

Sur un poste sans Docker Desktop, la base peut être un fichier SQLite : rien
à installer, il est dans Node. Copiez `server/.env.example` en `server/.env`
et décommentez-y la ligne :
>>>>>>> upstream/main

`.github/workflows/ci.yml` lance `npm test` à chaque `push`. Sur `main`, si
les tests passent, il construit les deux images et les publie dans le
registre de GitHub : `ghcr.io/<compte>/quizm9-api` et
`ghcr.io/<compte>/quizm9-client`, avec les tags `latest` et `sha-xxxxxxx`.

Sur une machine où il n'y a que Docker, `deploy/compose.yml` démarre Quiz M9
à partir de ces images, sans le code source.

## Avec Docker (semaine 3)

Sur une machine où seul Docker est installé :

```bash
docker compose up --build
```
<<<<<<< HEAD

Le client répond sur le port 5173, l'API sur le port 3000, et la base SQLite
vit dans le volume `quizm9-data`. Voir `compose.yml`, `server/Dockerfile` et
`client/Dockerfile`.
=======
DATABASE_URL=sqlite:data/quizm9.db
```

Puis `npm run dev` et `npm test` comme d'habitude, sans `docker compose`. Le
fichier `server/data/quizm9.db` n'est pas versionné ; pour repartir à neuf,
supprimez-le. Seuls « Regarder dans la base » et « Tout en conteneurs »
demandent Docker.

## Regarder dans la base

```bash
docker compose exec postgres psql -U quizm9
```

## Tout en conteneurs

```bash
docker compose up --build
```

Arrêtez d'abord `npm run dev` : les ports 3000 et 5173 sont les mêmes.
>>>>>>> upstream/main
