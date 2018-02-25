# Gnosis SDK Example
Just a simple example on using the Gnosis Prediction Market SDK.

## Demo
Check out the demo in:

* [https://wizardly-pasteur-5717ab.netlify.com/]()

## Run it locally

Install Ganache:
```bash
npm install -g ganache-cli
```

Run JSON RPC:
```bash
ganache-cli -d -i 437894314312
```

Install dependencies:
```js
git submodule update --init --recursive
cd gnosis-contracts
npm install
npm run migrate
cd ..
npm install
```

Run the dev server:
```js
npm start
```