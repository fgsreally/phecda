export async function genUnImportRet() {
  try {
    const allExports = Object.keys(await import("../dist/index.mjs"));
    const { createUnimport } = await import("unimport");

    return createUnimport({
      imports: allExports.map((k) => {
        return { name: k, from: "phecda-server" };
      }),
    });
  } catch (e) {
    return false;
  }
}
