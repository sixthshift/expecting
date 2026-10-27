// Make the hash for EXPECTING_PASSWORD_HASH from the household password.
//
//   bun run password
//
// Prints the hash, then how to write it where it goes: Compose's docker/.env
// takes it in single quotes; Bun's .env needs each `$` escaped, because Bun
// expands `$` even inside quotes.

const password = prompt("Household password:")?.trim();
if (!password || password.length < 8) {
  console.error("Use at least 8 characters.");
  process.exit(1);
}
const hash = await Bun.password.hash(password, { algorithm: "argon2id" });
console.log(hash);
console.error(`\nIn docker/.env (Compose):  EXPECTING_PASSWORD_HASH='${hash}'`);
console.error(`In .env (bun run dev):     EXPECTING_PASSWORD_HASH=${hash.replaceAll("$", "\\$")}`);
