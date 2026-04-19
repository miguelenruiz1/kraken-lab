# @kraken-lab/ai

AI-assisted Gherkin generation for Kraken.

Describe what you want to test in Spanish and get back a `.feature` file written in **Kraken's native dialect** — ready to drop into a `kraken-node` project. Optionally also get the WebdriverIO step definitions for the non-builtin steps.

## Methodology

The prompt follows the structure Mario Linares-Vásquez teaches in [AutTestingCodelabs / AI test cases generation](https://thesoftwaredesignlab.github.io/AutTestingCodelabs/AI-test-cases-generation/): `MISIÓN / ENTRADA / INSTRUCCIONES / FORMATO DE SALIDA`, ISTQB Test Analyst framing, equivalence partitioning + boundary values + negative cases.

Output contract is Kraken-native (not a parallel framework):
- Tags `@user1`, `@user2`, `@web`, `@mobile`
- Property placeholders `<VAR>` resolved by Kraken's `PropertyManager`
- Faker tokens `$name_1`, `$email_1` resolved by Kraken's `KrakenFaker`
- Step definitions in WebdriverIO style (`this.driver.url()`, `this.driver.$(selector)`) compatible with `src/clients/WebClient.ts`

## Install

From this workspace:
```bash
cd packages/ai
npm install
npm run build
```

## Environment

```bash
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env
```

Or export `ANTHROPIC_API_KEY` in your shell.

## CLI

```bash
# Generate only a .feature
npx kraken-ai generate --prompt "Validar login con credenciales válidas e inválidas"

# Generate feature + WebdriverIO step defs
npx kraken-ai generate --with-steps --prompt "..." --output features/login.feature

# Use a bigger model
npx kraken-ai generate --prompt "..." --model claude-opus-4-7
```

## License

MIT © 2026 Miguel Ruiz.
