import { pathToFileURL } from "url";
const base = "https://example.com/";

export async function resolve(specifier, context, nextResolve) {
  const { parentURL = null } = context;

  // Defer to the next hook in the chain, which would be the
  // Node.js default resolve if this is the last user-specified loader.
  return nextResolve(specifier);
}
let count = 1;

export async function load(a, b, c) {
  const ret = await c(a);
  console.log(a);
  if (a.includes("?")) ret.source = Buffer.from("export default " + count++);

  return ret;
}
