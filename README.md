🎃 json-squash
![JSON-Squash](https://cloud.githubusercontent.com/assets/17054134/26528243/59f566c6-43a7-11e7-860d-0c398c4474e1.png)

> Squash JSON-Patch operations patch into a mathematically equivalent smaller patch

## Installation

Using npm:
```sh
npm install json-squash --save
```

Using yarn:
```sh
yarn add json-squash
```


## Usage:
Using CommonJS:
```js
const squash = require('json-squash');

```js
const patch = [
  { "op": "add", "path": "/a/b/c", "value": 1},
  { "op": "replace", "path": "/a/b/c", "value": 12 },
  { "op": "replace", "path": "/a/b/c", "value": 123 },
  { "op": "replace", "path": "/a/b/c", "value": 1234 },
  { "op": "move", "from": "/a/b/c", "path": "/a/b/d" },
  { "op": "replace", "path": "/a/b/d", "value": 12345 },
];

const squashed = squash(patch);
// ==> [{ "op": "add", "path": "/a/b/d", "value": 12345 }]
```

## Testing

json-squash uses [ava](https://github.com/avajs/ava) test runner. To test,
```sh
git clone https://github.com/alshakero/json-squash.git
cd json-squash
npm install
npm test
```

## Contributing

- Fork this repo.
- Run tests before any modifications to make sure they run.
- Modify.
- Test again. Please add suites if your modifications add new functionality.
- Send a PR request.
- Receive big thanks!

## Author

By Omar Alshaker

## License
MIT 2017
