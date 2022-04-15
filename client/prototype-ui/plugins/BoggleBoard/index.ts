import { LitElement, html } from "lit";
import { property } from "lit/decorators.js";
import { BoggleBoard, GameState } from "../../../../api/types";
import { HathoraConnection } from "../../../.hathora/client";

export default class BoggleBoardPlugin extends LitElement {
  @property() val!: BoggleBoard;
  @property() state!: GameState;
  @property() client!: HathoraConnection;

  render() {
    return html`Hello world!`;
  }

  firstUpdated() {}

  updated() {}
}
