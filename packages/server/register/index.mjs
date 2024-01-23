import { register } from "node:module";
import { MessageChannel } from "node:worker_threads";
import { log } from "../dist/index.mjs";
const { port1, port2 } = new MessageChannel();

register("./loader.mjs", {
  parentURL: import.meta.url,
  data: { port: port2 },
  transferList: [port2],
});

port1.on("message", async (data) => {
  if (!globalThis.__PS_HMR__) return;

  const { type, files } = JSON.parse(data);
  if (type === "change") {
    log("reload module...");

    for (const cb of globalThis.__PS_HMR__) await cb(files);

    log("reload done");
  }
});
