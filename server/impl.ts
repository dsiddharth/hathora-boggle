/// <reference types="./pf" />

import { Methods, Context } from "./.hathora/methods";
import { Response } from "../api/base";
import {
  GameStatus,
  GameState,
  UserId,
  IInitializeRequest,
  IJoinGameRequest,
  IStartRoundRequest,
  IMakeGuessRequest,
} from "../api/types";

import pfBoggle from "pf-boggle";

type InternalState = GameState;

export class Impl implements Methods<InternalState> {
  initialize(ctx: Context, request: IInitializeRequest): InternalState {
    return {
      players: [],
      boggleBoard: [],
      validGuessess: [],
      gameStatus: 0,
      timeRemaining: 0,
    };
  }
  joinGame(state: InternalState, userId: UserId, ctx: Context, request: IJoinGameRequest): Response {
    if (state.players.find((p) => p.id === userId) !== undefined) {
      return Response.error("Already joined");
    }
    state.players.push({
      id: userId,
      validGuesses: [],
      invalidGuesses: [],
      score: 0
    });
    return Response.ok();
  }
  startRound(state: InternalState, userId: UserId, ctx: Context, request: IStartRoundRequest): Response {
    const player = state.players.find((p) => p.id === userId)
    if (player === undefined) {
      return Response.error("Player not joined");
    }
    if (state.gameStatus != GameStatus.WAITING) {
      return Response.error("Game already started");
    }
    if (request.duration < 10) {
      return Response.error("Game duration must be at least 10 seconds");
    }
    state.timeRemaining = request.duration;
    state.gameStatus = GameStatus.IN_PROGRESS;
    state.boggleBoard = pfBoggle.generate(4);
    state.validGuessess = pfBoggle.solve(state.boggleBoard).map((a: any) => a.word);

    // Reset player score
    state.players = state.players.map((p) => {
      return {
        ...p,
        validGuesses: [],
        invalidGuesses: [],
        score: 0
      };
    })
    return Response.ok();
  }
  makeGuess(state: InternalState, userId: UserId, ctx: Context, request: IMakeGuessRequest): Response {
    const player = state.players.find((p) => p.id === userId)
    if (player === undefined) {
      return Response.error("Player not joined");
    }
    if (state.gameStatus !== GameStatus.IN_PROGRESS) {
      return Response.error("Game not started");
    }
    const guess = request.guess.toUpperCase();
    if (!state.validGuessess.includes(guess)) {
      player.invalidGuesses.push(guess);
    } else {
      player.validGuesses.push(guess);
      player.score += pfBoggle.points(guess);
    }
    return Response.ok();
  }
  getUserState(state: InternalState, userId: UserId): GameState {
    return state;
  }
  onTick(state: InternalState, ctx: Context, timeDelta: number): void {
    if (state.timeRemaining <= 0) {
      state.timeRemaining = 0;
      state.gameStatus = GameStatus.WAITING;
      return;
    }
    state.timeRemaining -= timeDelta;
  }
}