// =================================================================================
// FILE: src/games/index.js
// =================================================================================
import * as crazyEights from './crazy_eights';
// import * as hearts from './hearts'; // Example of how you would add a new game

export const gameRegistry = {
  crazy_eights: crazyEights,
  // hearts: hearts, // And register it here
};
