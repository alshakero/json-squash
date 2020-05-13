export type Operation = AddOperation<any> | RemoveOperation | ReplaceOperation<any> | MoveOperation | CopyOperation | TestOperation<any>;

interface BaseOperation {
    path: string;
}
interface AddOperation<T> extends BaseOperation {
    op: 'add';
    value: T;
}
interface RemoveOperation extends BaseOperation {
    op: 'remove';
}
interface ReplaceOperation<T> extends BaseOperation {
    op: 'replace';
    value: T;
}
interface MoveOperation extends BaseOperation {
    op: 'move';
    from: string;
}
interface CopyOperation extends BaseOperation {
    op: 'copy';
    from: string;
}
interface TestOperation<T> extends BaseOperation {
    op: 'test';
    value: T;
}
/**
 * Squashes a json-patch patch into a smaller one if possible.
 * @param {Array} patch Your input patch
 * @returns {Array} The squash patch
 */
export default function squash<T>(patch: Operation[]): Operation[];
