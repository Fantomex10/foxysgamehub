# Foxy's Game Hub - Crazy Eights

Foxy's Game Hub is a robust, real-time, multiplayer card game platform built with React and Firebase. Initially centered on the game of Crazy Eights, the project's architecture is designed to be a scalable, multi-game portal.

This project rapidly evolved from a single-file prototype into a feature-rich Beta application with a sophisticated, decoupled architecture. It features a stable online multiplayer experience and a foundation for future offline and AI-powered gameplay.

## Key Features

- **Real-time Online Multiplayer:** Create or join game lobbies for Crazy Eights.
- **Intelligent AI Opponent ** COMING SOON **:** Play offline against "Foxy AI", powered by the Google Gemini API.
- **Robust Player Presence:** Utilizes Firebase Realtime Database to track player connectivity, handling disconnects and rejoins with a 60-second grace period.
- **Complete Crazy Eights Ruleset:** Implements special card rules for Aces (reverse), Jacks (skip), Twos (draw two), and Eights (wild card).
- **Multi-Deck Support:** Automatically scales to use two decks for games with 5 or more players.
- **Game Lobby & Management:** Features a lobby with public game listings, a 4-digit join code system, and automated cleanup of stale or abandoned games.
- **Modern UI/UX:**
  - **Optimistic UI:** Card plays feel instant and fluid.
  - **Responsive Design:** A dynamic, fanned card layout that adapts to screen size.
  - **UI Scaling:** Options for "Normal" and "Large" UI to suit different devices.
  - **Game History:** A "Past Moves" dropdown to review the last few actions.

## System Architecture

The application operates on a layered architecture designed for scalability and a clear separation of concerns, making it easy to debug, maintain, and extend with new games.



#### Core Technologies

- **Frontend:** React (Vite), Tailwind CSS
- **Backend & Real-time:** Firebase (Firestore for game state, Realtime Database for player presence)
- **Drag & Drop:** `@dnd-kit/core` for smooth card interactions.
- **AI Opponent:** `@google/genai` for strategic offline gameplay.

#### Architectural Layers

1.  **Firebase Layer (`FirebaseProvider.jsx`):** A singleton that handles the raw connection to Firebase services and user authentication.
2.  **Service Layer (`gameService.js`, `aiService.js`):** Acts as the sole API for all external operations (Firestore database writes, Gemini API calls).
3.  **Session Layer (`useGameSession.js`):** The master controller for a user's connection to an online game. It listens for real-time Firestore updates and synchronizes the server state with the local game engine.
4.  **Engine Layer (`GameEngine.js`):** A generic, in-memory state machine for turn-based card games. It holds the local game state and processes actions via a reducer. It knows nothing about Firebase or specific game rules.
5.  **Hooks (`useGameState.js`, `useGameActions.js`):** The glue between the UI and the engine. `useGameState` allows components to subscribe to state changes, while `useGameActions` provides stable functions for the UI to dispatch actions (e.g., `playCard`), which then directs them to the local engine or the `gameService` based on the game mode.
6.  **Component Layer (UI):** "Dumb" React components that are only responsible for displaying data from `useGameState` and calling actions from `useGameActions`.

## Getting Started

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root of the project and add your Firebase and Google AI configuration:

    ```env
    # Your Firebase Project Configuration
    VITE_FIREBASE_API_KEY="AIza..."
    VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
    VITE_FIREBASE_PROJECT_ID="your-project-id"
    VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
    VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
    VITE_FIREBASE_APP_ID="1:12345..."
    VITE_FIREBASE_DATABASE_URL="https://your-project-default-rtdb.firebaseio.com"

    # Your Google AI API Key for the AI opponent
    VITE_API_KEY="AIza..."
    ```
    *Note: The `VITE_` prefix is required for Vite to expose these variables to the frontend code.*

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

## Project Status & Known Issues

The project is in a **highly stable, feature-rich Beta state**. The core online multiplayer gameplay loop has been battle-tested and refactored to resolve a cascade of complex bugs related to state synchronization, race conditions, and backend security rules.

- **Priority #1:** The client-side authorization logic needs to be fully migrated to server-side **Firestore Security Rules** to prevent cheating and secure the database in a production environment.
- **Known Bug:** A minor state propagation issue can cause the Options Menu to freeze if it's open during the transition from the game lobby to the game room.

## Future Roadmap

The current architecture provides a solid foundation for focused expansion.

-   **Phase 1: Immediate Polish**
    -   Add smooth card animations for dealing, playing, and drawing.
    -   Implement an immutable "Play Again" flow where the host seamlessly creates a new game for all players.
    -   Enhance the spectator mode with a queue system.

-   **Phase 2: Feature Expansion**
    -   Add lobby options for custom game rules (e.g., stacking "Draw 2" cards).
    -   Implement password-protected private games.
    -   Develop a fully offline, rule-based bot by training it on data generated by the Gemini AI.

-   **Phase 3: The Platform Vision**
    -   Leverage the decoupled architecture to add more games (Hearts, Spades, Rummy, etc.).
    -   Transition from anonymous authentication to a full user account system with persistent profiles and stats.
    -   Implement a friends list and direct game invite system.


# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
