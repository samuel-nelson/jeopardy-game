# Jeopardy Game

A fully functioning, themed, and animated Jeopardy game with real-time multiplayer support, buzzer system, and admin panel for creating custom questions.

## Features

- **Real-time Multiplayer**: Play with friends remotely using WebSocket connections
- **Buzzer System**: First-press-wins buzzer with keyboard support (spacebar)
- **Two Game Modes**:
  - **Host Mode**: One host controls the board and scoring
  - **Player Mode**: All players are equal, first to buzz answers
- **Default Questions**: Pre-loaded with 5 categories × 5 questions
- **Admin Panel**: Create, edit, and manage custom question sets
- **Themed UI**: Classic Jeopardy blue and gold color scheme
- **Animations**: Smooth transitions and reveal animations
- **Responsive Design**: Works on desktop and mobile devices

## Installation

1. Install dependencies for all packages:
```bash
npm run install-all
```

Or install manually:
```bash
npm install
cd server && npm install
cd ../client && npm install
```

## Running the Application

### Local Development (Socket.io + Express Server)

The app automatically uses Socket.io and the local Express server when running in development mode.

Run both server and client concurrently:
```bash
npm run dev
```

This starts:
- **Backend server** on http://localhost:5000 (Socket.io + Express)
- **React frontend** on http://localhost:3000

Or run separately:

**Server** (runs on http://localhost:5000):
```bash
npm run server
```

**Client** (runs on http://localhost:3000):
```bash
npm run client
```

### Production Mode (Netlify + Pusher)

When deployed to Netlify, the app automatically uses:
- **Netlify Functions** for the API
- **Pusher** for real-time features

No server needed! Everything runs serverless.

### Production Build

Build the client:
```bash
npm run build
```

Then run the server:
```bash
cd server && npm start
```

## How to Play

1. **Start a Game**:
   - Enter your name
   - Choose game mode (Host or Player)
   - Set player limit (2-10)
   - Select a question set
   - Click "Create Room"
   - Share the Room ID with other players

2. **Join a Game**:
   - Enter your name
   - Enter the Room ID
   - Click "Join Room"

3. **Playing**:
   - Click on a question value to reveal it
   - Press SPACEBAR or click the buzzer to answer
   - First person to buzz gets to answer
   - Host (in Host Mode) or players (in Player Mode) can adjust scores

4. **Admin Panel**:
   - Click "Admin Panel" from the lobby
   - Create new question sets
   - Add categories and questions
   - Import/export question sets as JSON
   - Edit or delete existing sets

## Project Structure

```
Jep/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/        # Main pages
│   │   ├── services/     # API and WebSocket services
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Utility functions
│   └── public/
├── server/               # Node.js backend
│   ├── routes/           # Express routes
│   ├── sockets/          # Socket.io handlers
│   ├── data/             # Question data files
│   └── utils/            # Server utilities
└── package.json
```

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, Socket.io
- **Real-time**: WebSocket (Socket.io)
- **Styling**: Tailwind CSS with custom Jeopardy theme

## API Endpoints

- `GET /api/questions/default` - Get default questions
- `GET /api/questions/custom` - List custom question sets
- `GET /api/questions/custom/:id` - Get specific custom set
- `POST /api/questions/custom` - Save custom question set
- `DELETE /api/questions/custom/:id` - Delete custom set

## Socket Events

### Client → Server
- `create-room` - Create a new game room
- `join-room` - Join an existing room
- `leave-room` - Leave the current room
- `select-question` - Select a question to reveal
- `reveal-answer` - Reveal the answer
- `close-question` - Close the current question
- `update-score` - Update a player's score
- `buzz` - Press the buzzer
- `reset-buzzer` - Reset the buzzer (host only)

### Server → Client
- `room-created` - Room created successfully
- `room-joined` - Joined room successfully
- `room-error` - Error joining/creating room
- `player-joined` - New player joined
- `player-left` - Player left
- `question-selected` - Question was selected
- `answer-revealed` - Answer was revealed
- `question-closed` - Question was closed
- `score-updated` - Score was updated
- `buzzer-pressed` - Someone buzzed in
- `buzzer-reset` - Buzzer was reset
- `buzz-error` - Error with buzzer

## Deployment

### Deploy to Netlify (Static Frontend)

The frontend can be deployed to Netlify as a static site. The backend must be deployed separately to a service that supports WebSockets (like Render or Railway).

See [NETLIFY_DEPLOY.md](./NETLIFY_DEPLOY.md) for detailed instructions.

**Quick Steps:**
1. Deploy backend to Render (see [DEPLOYMENT.md](./DEPLOYMENT.md))
2. Deploy frontend to Netlify:
   - Connect GitHub repo
   - Build command: `cd client && npm install && npm run build`
   - Publish directory: `client/build`
   - Set environment variables:
     - `REACT_APP_API_URL` = Your backend URL + `/api`
     - `REACT_APP_SOCKET_URL` = Your backend URL

### Deploy Full Stack to Render

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full-stack deployment instructions.

## License

MIT

