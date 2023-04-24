import {
  TILE_EXIT_GATE,
  TILE_PIT,
  TILE_SLIDER_UP,
  TILE_SLIDER_DOWN,
  TILE_SLIDER_LEFT,
  TILE_SLIDER_RIGHT,
} from "../../modules/game-constants.js";

// GameUtils class contains all the basic game logic that can be reused by all bots.
// Also contains some helper functions that can be used by the bots.

export default class GameUtils {
  distance(x1, y1, x2, y2) {
    const a = x1 - x2;
    const b = y1 - y2;

    return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
  }

  findExits(game) {
    return game.map.reduce((exits, row, y) => {
      row.forEach((tile, x) => {
        if (tile.type === TILE_EXIT_GATE) exits.push({ x, y });
      });

      return exits;
    }, []);
  }

  findPits(game) {
    return game.map.reduce((pits, row, y) => {
      row.forEach((tile, x) => {
        if (tile.type === TILE_PIT) pits.push({ x, y });
      });

      return pits;
    }, []);
  }

  findTileByPosition(x, y, game) {
    return game.map[y][x];
  }

  findSpecialAgent(type, game) {
    return game.special_agents.find((agent) => agent.type === type) || null;
  }

  isStaying(move, game) {
    return (
      move?.x === game.players.bearer.possible_moves[0]?.x &&
      move?.y === game.players.bearer.possible_moves[0]?.y
    );
  }

  isNearby(position, specialAgentPosition, distance = 1) {
    return (
      this.distance(
        position?.x,
        position?.y,
        specialAgentPosition?.x,
        specialAgentPosition?.y
      ) <= distance
    );
  }

  isCloser(currentPosition, targetA, targetB) {
    return (
      this.distance(
        currentPosition?.x,
        currentPosition?.y,
        targetA?.x,
        targetA?.y
      ) <
      this.distance(
        currentPosition?.x,
        currentPosition?.y,
        targetB?.x,
        targetB?.y
      )
    );
  }

  getClosestExit(game) {
    const exits = this.findExits(game);
    let distances = [];

    for (const exit of exits) {
      const distance = this.distance(
        game?.players?.bearer?.position?.x,
        game?.players?.bearer?.position?.y,
        exit?.x,
        exit?.y
      );

      distances.push({ exit, distance });
    }

    distances.sort((a, b) => a.distance - b.distance);

    return distances[0]?.exit || null;
  }

  getTargetTowardsExit(targets, exit) {
    let distances = [];

    for (const position of targets) {
      const distance = this.distance(
        position?.x,
        position?.y,
        exit?.x,
        exit?.y
      );

      distances.push({ position, distance });

      distances.sort((a, b) => a.distance - b.distance);
    }

    return distances[0]?.position || null;
  }

  getRandomMove(game) {
    const possibleMoves = game.players.bearer.possible_moves.filter(
      (move) => move.type !== TILE_PIT
    );

    return possibleMoves[
      Math.floor(Math.random() * game.players.bearer.possible_moves.length)
    ];
  }

  getRandomTarget(targets) {
    const randomIndex = Math.floor(Math.random() * targets.length);
    return targets[randomIndex];
  }

  getShortestDistanceMove(targets, game) {
    let distances = [];

    for (const position of targets) {
      for (const possibleMove of game.players.bearer.possible_moves) {
        const distance = this.distance(
          possibleMove?.x,
          possibleMove?.y,
          position?.x,
          position?.y
        );

        distances.push({ move: possibleMove, distance });
      }
    }

    // Remove pits from the distances array
    distances = distances.filter((distance) => distance.type !== TILE_PIT);

    // Sort by distance, slider tiles should be at the end of the array
    distances
      .sort((a, b) => a.distance - b.distance)
      .sort((a, b) => {
        if (
          a.type === TILE_SLIDER_UP ||
          a.type === TILE_SLIDER_DOWN ||
          a.type === TILE_SLIDER_LEFT ||
          a.type === TILE_SLIDER_RIGHT
        ) {
          return 1;
        }

        return -1;
      });

    if (this.isStaying(distances[0].move, game)) {
      return this.getRandomMove(game);
    }

    return distances[0].move;
  }

  getFarthestDistanceMove(position, game) {
    let longestDistance = 0;
    let move;

    const possibleMoves = game.players.bearer.possible_moves.filter(
      (distance) => distance.type !== TILE_PIT
    );

    for (const possibleMove of possibleMoves) {
      const distance = this.distance(
        possibleMove?.x,
        possibleMove?.y,
        position?.x,
        position?.y
      );

      if (distance > longestDistance) {
        longestDistance = distance;
        move = possibleMove;
      }
    }

    return move;
  }
}
