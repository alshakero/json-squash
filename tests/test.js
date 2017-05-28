/**
 * json-squash
 * @module json-squash
 * @license MIT
 * @author Omar Alshaker <omar@omaralshaker.com>
 */

import test from 'ava';
import squash from '..';
import jsonpatch from 'fast-json-patch';
import clone from 'clone';

test('Empty patch should be returned', t => {
  const patch = [];
  const squashed = squash(patch);
  t.deepEqual(squashed, []);
});
test("single operations shouldn't be squashed", t => {
  ['add', 'replace', 'remove', 'test', 'copy', 'move'].forEach((op, i) => {
    if (op == 'copy' || op == 'move') {
      var patch = [{ op, path: '/path/' + i, from: '/fromPath/' + i }];
    } else {
      var patch = [{ op, path: '/path/' + i, value: i }];
    }
    const squashed = squash(patch);
    t.deepEqual(squashed, patch);
  });
});
test('Multiple adds should be collapsed to the last add', t => {
  const patch = [];
  for (let i = 0; i <= 50; i++) {
    patch.push({ op: 'add', path: '/path/1', value: i });
  }
  const squashed = squash(patch);
  t.deepEqual(squashed, [{ op: 'add', path: '/path/1', value: 50 }]);
});
test("`add` with `-` path shouldn't be squashed", t => {
  const patch = [];
  for (let i = 0; i <= 50; i++) {
    patch.push({ op: 'add', path: '/path/-', value: i });
  }
  const squashed = squash(patch);
  t.deepEqual(squashed, patch);
});
test('Multiple replaces should be collapsed to the last replace', t => {
  const patch = [];
  for (let i = 0; i <= 50; i++) {
    patch.push({ op: 'replace', path: '/path/1', value: i });
  }
  const squashed = squash(patch);
  t.deepEqual(squashed, [{ op: 'replace', path: '/path/1', value: 50 }]);
});
test('`add` then `replace` should be squashed to only `add` with the new value', t => {
  const patch = [];
  patch.push({ op: 'add', path: '/path/2', value: 'addValue' });
  patch.push({ op: 'replace', path: '/path/2', value: 'replaceValue' });

  const squashed = squash(patch);
  t.deepEqual(squashed, [
    { op: 'add', path: '/path/2', value: 'replaceValue' }
  ]);
});
test('`add` operation should discard all precedent (`replace`, `copy`, `remove`) operations', t => {
  const patch = [];
  patch.push({ op: 'replace', path: '/path/2', value: 'addValue' });
  patch.push({ op: 'replace', path: '/path/2', value: 'replaceValue' });
  patch.push({ op: 'remove', path: '/path/2' });
  patch.push({ op: 'copy', path: '/path/2', from: '/path/3' });
  patch.push({ op: 'add', path: '/path/2', value: 'finalValue' });

  const squashed = squash(patch);
  t.deepEqual(squashed, [{ op: 'add', path: '/path/2', value: 'finalValue' }]);
});
test('`remove` operation should remove precedent `add` operation', t => {
  const patch = [];
  patch.push({ op: 'add', path: '/path/2', value: 'someValue' });
  patch.push({ op: 'remove', path: '/path/2' });
  const squashed = squash(patch);
  t.deepEqual(squashed, [{ op: 'remove', path: '/path/2' }]);
});
test('`remove` operation should delete precedent `replace` operation', t => {
  const patch = [];
  patch.push({ op: 'replace', path: '/path/2', value: 'addValue' });
  patch.push({ op: 'remove', path: '/path/2' });
  const squashed = squash(patch);
  t.deepEqual(squashed, [{ op: 'remove', path: '/path/2' }]);
});
test('`remove` operation should remove precedent `copy` operation', t => {
  const patch = [];
  patch.push({ op: 'copy', path: '/path/2', from: '/somePath' });
  patch.push({ op: 'remove', path: '/path/2' });
  const squashed = squash(patch);
  t.deepEqual(squashed, [{ op: 'remove', path: '/path/2' }]);
});
test('`remove` operation should remove precedent `remove` operation', t => {
  const patch = [];
  patch.push({ op: 'remove', path: '/path/2' });
  patch.push({ op: 'remove', path: '/path/2' });
  const squashed = squash(patch);
  t.deepEqual(squashed, [{ op: 'remove', path: '/path/2' }]);
});
test('`add` then `move` should discard the `move` operation and update `add` operation value', t => {
  const patch = [];
  patch.push({ op: 'add', path: '/path/2', value: 'addValue' });
  patch.push({ op: 'move', path: '/path/3', from: '/path/2' });
  const squashed = squash(patch);
  t.deepEqual(squashed, [{ op: 'add', path: '/path/3', value: 'addValue' }]);
});
test('`add` then `test` then `move` should preserve the order', t => {
  const patch = [];
  patch.push({ op: 'add', path: '/path/2', value: 'addValue' });
  patch.push({ op: 'test', path: '/path/2', value: 'addValue' });
  patch.push({ op: 'move', path: '/path/3', from: '/path/2' });
  const squashed = squash(patch);
  t.deepEqual(squashed, patch);
});
test('`add` then `replace` then `test` then `move` should merge add + replace ONLY', t => {
  const patch = [];

  patch.push({ op: 'add', path: '/path/2', value: 'addValue' });
  patch.push({ op: 'replace', path: '/path/2', value: 'replaceValue' });
  patch.push({ op: 'test', path: '/path/2', value: 'replaceValue' });
  patch.push({ op: 'move', path: '/path/3', from: '/path/2' });

  const expected = [];
  expected.push({ op: 'add', path: '/path/2', value: 'replaceValue' });
  expected.push({ op: 'test', path: '/path/2', value: 'replaceValue' });
  expected.push({ op: 'move', path: '/path/3', from: '/path/2' });

  const squashed = squash(patch);
  t.deepEqual(squashed, expected);
});

test("`test` operations path shouldn't be squashed", t => {
  const patch = [];
  for (let i = 0; i <= 50; i++) {
    patch.push({ op: 'test', path: '/path/' + i, value: i });
  }
  const squashed = squash(patch);
  t.deepEqual(squashed, patch);
});

test('`add` then `copy` (for existing item) should convert to two adds (add is faster)', t => {
  const patch = [];
  patch.push({ op: 'add', path: '/path/2', value: 'addValue' });
  patch.push({ op: 'copy', path: '/path/3', from: '/path/2' });

  const expected = [];
  expected.push({ op: 'add', path: '/path/2', value: 'addValue' });
  expected.push({ op: 'add', path: '/path/3', value: 'addValue' });

  const squashed = squash(patch);
  t.deepEqual(squashed, expected);
});
test('`add` then `copy` (for non-existing item) should stay the same', t => {
  const patch = [];
  patch.push({ op: 'add', path: '/path/2', value: 'addValue' });
  patch.push({ op: 'copy', path: '/path/3', from: '/path/4' });

  const squashed = squash(patch);
  t.deepEqual(squashed, patch);
});
/* we always keep remove, in case copy was overwriting an existing element, remove should stay to remove it */
test('`add` then `copy` then `remove` should result only remove', t => {
  const patch = [];
  patch.push({ op: 'add', path: '/path/2', value: 'addValue' });
  patch.push({ op: 'copy', path: '/path/3', from: '/path/2' });
  patch.push({ op: 'remove', path: '/path/3' });

  const expected = [
    { op: 'add', path: '/path/2', value: 'addValue' },
    { op: 'remove', path: '/path/3' }
  ];

  const squashed = squash(patch);
  t.deepEqual(squashed, expected);
});
test('`copy` should deep clone not reference', t => {
  const object = { name: 'omar' };
  const patch = [];
  patch.push({ op: 'add', path: '/path/2', value: object });
  patch.push({ op: 'copy', path: '/path/3', from: '/path/2' });

  const squashed = squash(patch);

  // they will be converted to two add operations with the second having a deep cloned object
  t.deepEqual(squashed[1].value, object);

  // however, they should be different references
  t.true(squashed[1].value != object);
});
test('`move` should NOT deep clone', t => {
  const object = { name: 'Omar' };
  const patch = [];

  patch.push({ op: 'add', path: '/path/2', value: object });
  patch.push({ op: 'move', path: '/path/3', from: '/path/2' });

  const squashed = squash(patch);

  t.deepEqual(squashed, [{ op: 'add', path: '/path/3', value: object }]);

  // and, it should have the same references
  t.true(squashed[0].value == object);
});
