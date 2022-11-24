# Parse figma tokens

`parse-figma-tokens` will parse your `tokens.json` figma-token to a typescript file

## Install Parse figma tokens

Parse figma tokens can be installed through multiple channels.

### Install with npm or Yarn

[Parse figma tokens is available as an npm package](). If you have Node.js installed locally, you can install it by running:

```bash
npm install parse-figma-tokens
```

or if you are using Yarn:

```bash
yarn add parse-figma-tokens
```

## Getting started with Parse figma tokens

Once you installed the Parse figma tokens, you can use by creating a `parseFigmaTokens.mjs` file:

```js
// parseFigmaTokens.mjs
import parseTokens from "parse-figma-tokens";

const [input, output] = process.argv.slice(2);

await parseTokens(input, output);
```
Once the `parseFigmaTokens.mjs` is created, we can run the following script as a build step or in the terminal. _Note that we include an example path, replace this with your own pathnames._

```json
// package.json
 "scripts": {
  "postinstall": "node parseFigmaTokens.mjs src/figma-token/token.json src/figma-token/output/token.ts",
 },

```
or
```bash
node parseFigmaTokens.mjs src/figma-token/token.json src/figma-token/output/token.ts
```