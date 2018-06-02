# 🎃 json-squash

> Squash JSON-Patch operations patch into a mathematically equivalent smaller patch. Shines the most for array splice and shift patches. Removing a single element from an array, whererver it is in the array, will produce a single patch 🙌

[![Build Status](https://travis-ci.org/alshakero/json-squash.svg?branch=master)](https://travis-ci.org/alshakero/json-squash)

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

```js
const squash = require('json-squash');
// or
import squash from 'json-squash';

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


// array shift
const obj = {arr: [1, 2, 3, 4, 5, 6]};
obj.arr.shift();

// fast-json-patch diff result
const patch = [
  {op: "replace", path: "/arr/0", value: 2},
  {op: "replace", path: "/arr/1", value: 3},
  {op: "replace", path: "/arr/2", value: 4},
  {op: "replace", path: "/arr/3", value: 5},
  {op: "replace", path: "/arr/4", value: 6},
  {op: "remove", path: "/arr/5"}
];

const squashed = squash(patch);
// ==> [{ "op": "remove", "path": "arr/0" }]
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
- Run `npm install`.
- Run tests before any modifications to make sure they run.
- Modify.
- Test again. Please add suites if your modifications add new functionality.
- Send a PR request.
- Receive big thanks!

## Author

Omar Alshaker

## License
MIT 2017
