import test from 'ava';
import squash from '..';
import jsonpatch from 'fast-json-patch';
import clone from 'clone';
// TEST using the specs, with and without squashing, this might be useless because of patches are single operation, but it certainly doesn't harm
const rawTests = require('./json-patch-tests').filter(
  test => !test.disabled && test.expected
);

// test without squashing
const tests = clone(rawTests);
tests.forEach(suite => {
  var suiteName = suite.comment || suite.error || JSON.stringify(suite.patch);
  test(suiteName, t => {
    jsonpatch.applyPatch(suite.doc, suite.patch);
    t.deepEqual(suite.doc, suite.expected);
  });
});

// TEST using the specs, with squashing now
const testsAgain = clone(rawTests);
testsAgain.forEach(suite => {
  var suiteName = suite.comment || suite.error || JSON.stringify(suite.patch);
  test(suiteName, t => {
    const squashed = squash(suite.patch);
    jsonpatch.applyPatch(suite.doc, squashed);
    t.deepEqual(suite.doc, suite.expected);
  });
});
