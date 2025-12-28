import { getTag, Init } from "phecda-core";
import { Context, addAddon } from "../context";
import { ServerBase } from "./base";

export abstract class PAddon extends ServerBase {
  readonly key: PropertyKey;

  priority = 0;

  @Init
  // @ts-expect-error for internal
  private _init() {
    //@ts-expect-error initialize
    this.key = getTag(this);
    addAddon(this.key, this.use.bind(this), this.priority);
    this.onUnmount(() => {
      delete Context.addonRecord[this.key];
    });
  }

  abstract use(router: any, framework: string): undefined;
}
