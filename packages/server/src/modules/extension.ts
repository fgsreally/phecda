import { getTag } from "phecda-core";
import type { BaseCtx, BaseError } from "../types";
import { Context, addAddon, addFilter, addGuard, addPipe } from "../context";
import type { Exception } from "../exception";
import { ServerBase } from "./base";

export interface PExtension<Ctx extends BaseCtx = any, E extends Exception = Exception> {
  guard(ctx: Ctx, next: () => Promise<any>): any;

  pipe(
    param: { arg: any; option?: any; key: string; type: string; index: number; reflect: any },
    ctx: Ctx,
  ): any;

  filter(error: Error | E, ctx?: Ctx): BaseError;

  addon<Addon = any>(framework: string): Addon;
}

export class PExtension extends ServerBase {
  readonly key: PropertyKey;

  guardPriority: number;
  addonPriority: number;

  protected async init() {
    await super.init();
    //@ts-expect-error initialize
    this.key = getTag(this)

    if (this.pipe) {
      addPipe(this.key, this.pipe.bind(this));
      this.onUnmount(() => {
        // no safe enough
        delete Context.pipeRecord[this.key];
      });
    }

    if (this.addon) {
      addAddon(this.key, this.addon.bind(this), this.addonPriority);
      this.onUnmount(() => {
        delete Context.addonRecord[this.key];
      });
    }

    if (this.guard) {
      addGuard(this.key, this.guard.bind(this), this.guardPriority);
      this.onUnmount(() => {
        delete Context.guardRecord[this.key];
      });
    }

    if (this.filter) {
      addFilter(this.key, this.filter.bind(this));
      this.onUnmount(() => {
        delete Context.filterRecord[this.key];
      });
    }
  }
}
