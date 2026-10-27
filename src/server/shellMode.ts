// Every page request is answered with the shell: the document and the frame,
// with no page drawn and no loader run. The browser draws the page.
//
// Start's SPA mode already serves the shell in dev — its plugin sets
// TSS_SHELL for `vite dev` — and the build prerenders one, but a built server
// draws every page in full unless TSS_SHELL is set where it runs. Start reads
// the variable once, as its handler module loads, so this module is imported
// for its side effect first in src/server.ts, ahead of Start's own imports.
process.env.TSS_SHELL = "true";
