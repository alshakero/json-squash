/**
 * json-squash
 * @module json-squash
 * @license MIT
 * @author Omar Alshaker <omar@omaralshaker.com>
 */
const clone = require('clone');

function isReplaceOrAdd(operation) {
  return operation.op == 'add' || operation.op == 'replace';
}
/**
 * Squashes a json-patch patch into a smaller one if possible
 * @param {Array} patch Your input patch
 * @returns {Array} The squash patch
 */
function squash(patch) {
  if(patch.length < 2) {
    return patch;
  }
  const patchDictionary = {};
  const resultPatch = [];
  let index = Date.now() + 1;
  patch.forEach(function(operation) {
    switch (operation.op) {
      case 'add':
        // those `add`s with `-` index can have duplicates
        if (operation.path.endsWith('-')) {
          // make them non-overwritable
          index++;
          patchDictionary[operation.path + index] = operation;
        } else {
          patchDictionary[operation.path] = operation;
        }
        break;
      case 'replace':
        // if this replace came after an add, change it to an add and merge them
        if (
          patchDictionary[operation.path] &&
          patchDictionary[operation.path].op == 'add'
        ) {
          operation.op = 'add';
        }
        patchDictionary[operation.path] = operation;
        break;
      case 'move':
        // do we have a value added recently?
        if (
          patchDictionary[operation.from] &&
          isReplaceOrAdd(patchDictionary[operation.from])
        ) {
          // discard the move operation, and change the add's operation path to the move's operation path
          patchDictionary[operation.from].path = operation.path;
          patchDictionary[operation.path] = patchDictionary[operation.from];
          delete patchDictionary[operation.from];
          break;
        } else {
          // just keep move op as is
          patchDictionary[operation.path] = operation;
        }
        break;
      case 'copy':
        if (
          // do we have the source value in history ?
          patchDictionary[operation.from] &&
          isReplaceOrAdd(patchDictionary[operation.from])
        ) {
          // do we have the destination value in history ?
          if (
            patchDictionary[operation.path] &&
            isReplaceOrAdd(patchDictionary[operation.path])
          ) {
            // change the original operation to have the copied value and discard copy operation
            patchDictionary[operation.path].value =
              clone(patchDictionary[operation.from].value);
          } else {
            // we have source value, but not destination, convert it to an add, it's faster
            patchDictionary[operation.path] = {
              op: 'add',
              path: operation.path,
              value: clone(patchDictionary[operation.from].value)
            };
          }
        } else {
          // we neither have source or destination values, just add operation as is
          patchDictionary[operation.path] = operation;
        }
        break;
      case 'test':
        /* when a test operation comes, we need to preserve all operations to this point,
        e.g: add + replace = one add with the new value
        but add + test + replace = add + test + replace, we shouldn't merge add + replace in this case 
        and that's why we give the path a unique key to preserve it */
        if(patchDictionary[operation.path]) {
          ++index;
          patchDictionary[operation.path + index] = patchDictionary[operation.path];
          delete patchDictionary[operation.path];
        }
        // we don't want to overwrite (or be overwritten by) other operations with test operation, so we give a pseudo key
        ++index;
        patchDictionary[operation.path + index] = operation; // push as is
        break;
      case 'remove':
        // do we have it in history
        if (patchDictionary[operation.path]) {
          // if have an add, copy or move in history, they (op + remove) equalize to nothing
          if (
            ['replace', 'add', 'copy', 'replace'].indexOf(
              patchDictionary[operation.path].op
            ) > -1
          ) {
            patchDictionary[operation.path] = operation; // push as is
          }
        } else {
          // we don't have it in history
          patchDictionary[operation.path] = operation; // push as is
          break;
        }
      default:
        patchDictionary[operation.path] = operation; // push as is
        break;
    }
  });
  const newPatches = [];
  for (let path in patchDictionary) {
    newPatches.push(patchDictionary[path]);
  }
  return newPatches;
}
if (typeof module !== 'undefined') {
  Object.defineProperty(exports, "__esModule", { value: true });
  module.exports = squash;
  module.exports.default = squash;
}
