export type Options = {
	/**
	A function that accepts a folder path, and increments its index.

	It's the incrementer's responsibility to extract an already existing index from the given folder path so that it picks up and continues incrementing an already present index instead of appending a second one.

	The incrementer has to return a tuple of `[originalFoldername, incrementedFoldername]`, where `originalFoldername` is the foldername without the index, and `incrementedFoldername` is a foldername with input's index bumped by one.

	Default: Parentheses incrementer: `folder` → `folder (1)`

	@example
	```
	import {unusedFoldername} from 'unused-foldername';

	// Incrementer that inserts a new index as a prefix.
	const prefixIncrementer = foldername => {
		const match = foldername.match(/^(?<index>\d+)_(?<originalFoldername>.*)$/);
		let {originalFoldername, index} = match ? match.groups : {originalFoldername: foldername, index: 0};
		originalFoldername = originalFoldername.trim();
		return [`${originalFoldername}`, `${++index}_${originalFoldername}`];
	};

	console.log(await unusedFoldername('rainbow', {incrementer: prefixIncrementer}));
	//=> '1_rainbow'
	```
	*/
	readonly incrementer?: Incrementer;

	/**
	The maximum number of attempts to find an unused foldername.

	When the limit is reached, the function will throw `MaxTryError`.

	@default Infinity
	*/
	readonly maxTries?: number;
};

/**
@param foldername - The foldername of the folder path.
@param extension - The extension of the folder path.

@returns A tuple of original foldername, and new incremented foldername, including extension.
*/
export type Incrementer = (foldername: string, extension: string) => [string, string];

/**
The error thrown when `maxTries` limit is reached without finding an unused foldername.

@param originalPath - Path without the incrementation sequence.
@param lastTriedPath - The last tested incremented path.

@example
```
import {unusedFoldername, MaxTryError} from 'unused-foldername';

try {
	const path = await unusedFoldername('rainbow (1)', {maxTries: 0});
} catch (error) {
	if (error instanceof MaxTryError) {
		console.log(error.originalPath); // 'rainbow'
		console.log(error.lastTriedPath); // 'rainbow (1)'
	}
}
```
*/
export class MaxTryError extends Error {
	originalPath: string;
	lastTriedPath: string;

	constructor(originalPath: string, lastTriedPath: string);
}

/**
Get an unused foldername by appending a number if it exists: `folder` → `folder (1)`.

@param folderPath - The path to check for foldername collision.
@returns Either the original `foldername` or the `foldername` appended with a number (or modified by `option.incrementer` if specified).

If an already incremented `folderPath` is passed, `unusedFoldername` will simply increment and replace the already existing index:

@example
```
import {unusedFoldername} from 'unused-foldername';

console.log(await unusedFoldername('rainbow (1)'));
//=> 'rainbow (2)'
```
*/
export function unusedFoldername(folderPath: string, options?: Options): Promise<string>;

/**
Synchronously get an unused foldername by appending a number if it exists: `folder` → `folder (1)`.

@param folderPath - The path to check for foldername collision.
@returns Either the original `foldername` or the `foldername` appended with a number (or modified by `option.incrementer` if specified).

If an already incremented `folderPath` is passed, `unusedFoldername` will simply increment and replace the already existing index:

@example
```
import {unusedFoldernameSync} from 'unused-foldername';

console.log(unusedFoldernameSync('rainbow (1)'));
//=> 'rainbow (2)'
```
*/
export function unusedFoldernameSync(folderPath: string, options?: Options): string;

/**
Creates an incrementer that appends a number after a separator.

`separatorIncrementer('_')` will increment `folder` → `folder_1`.

Not all characters can be used as separators:
- On Unix-like systems, `/` is reserved.
- On Windows, `<>:"/|?*` along with trailing periods are reserved.

@example
```
import {unusedFoldername, separatorIncrementer} from 'unused-foldername';

console.log(await unusedFoldername('rainbow', {incrementer: separatorIncrementer('_')}));
//=> 'rainbow_1'
```
*/
export function separatorIncrementer(separator: string): Incrementer;
