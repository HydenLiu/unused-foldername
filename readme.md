# unused-foldername

> Get an unused foldername by appending a number if it exists: `folder` → `folder (1)`

Useful for safely writing, copying, moving folders without overwriting existing folders.

## Install

```sh
npm install unused-foldername
```

## Usage

```
.
├── rainbow (1)
├── rainbow
└── unicorn
```

```js
import {unusedFoldername} from 'unused-foldername';

console.log(await unusedFoldername('rainbow'));
//=> 'rainbow (2)'
```

## API

### unusedFoldername(folderPath, options?)

Returns a `Promise<string>` containing either the original `foldername` or the `foldername` increment by `options.incrementer`.

If an already incremented `folderPath` is passed, `unusedFoldername` will simply increment and replace the already existing index:

```js
import {unusedFoldername} from 'unused-foldername';

console.log(await unusedFoldername('rainbow (1)'));
//=> 'rainbow (2)'
```

### unusedFoldernameSync(folderPath, options?)

Synchronous version of `unusedFoldername`.

#### folderPath

Type: `string`

The path to check for foldername collision.

#### options

Type: `object`

##### incrementer

Type: `(folderPath: string) => [string, string]`\
Default: Parentheses incrementer: `folder` → `folder (1)`

A function that accepts a folder path, and increments its index.

It's the incrementer's responsibility to extract an already existing index from the given folder path so that it picks up and continues incrementing an already present index instead of appending a second one.

The incrementer has to return a tuple of `[originalFoldername, incrementedFoldername]`, where `originalFoldername` is the foldername without the index, and `incrementedFoldername` is a foldername with input's index bumped by one.

```js
import {unusedFoldername} from 'unused-foldername';

// Incrementer that inserts a new index as a prefix.
const prefixIncrementer = (foldername) => {
	const match = foldername.match(/^(?<index>\d+)_(?<originalFoldername>.*)$/);
	let {originalFoldername, index} = match ? match.groups : {originalFoldername: foldername, index: 0};
	originalFoldername = originalFoldername.trim();
	return [`${originalFoldername}`, `${++index}_${originalFoldername}`];
};

console.log(await unusedFoldername('rainbow', {incrementer: prefixIncrementer}));
//=> '1_rainbow'
```

##### maxTries

Type: `number`\
Default: `Infinity`

The maximum number of attempts to find an unused foldername.

When the limit is reached, the function will throw `MaxTryError`.

### separatorIncrementer

Creates an incrementer that appends a number after a separator.

`separatorIncrementer('_')` will increment `folder` → `folder_1`.

Not all characters can be used as separators:
- On Unix-like systems, `/` is reserved.
- On Windows, `<>:"/|?*` along with trailing periods are reserved.

```js
import {unusedFoldername, separatorIncrementer} from 'unused-foldername';

console.log(await unusedFoldername('rainbow', {incrementer: separatorIncrementer('_')}));
//=> 'rainbow_1'
```

### MaxTryError

The error thrown when `maxTries` limit is reached without finding an unused foldername.

It comes with 2 custom properties:

- `originalPath` - Path without incrementation sequence.
- `lastTriedPath` - The last tested incremented path.

Example:

```js
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

## Related

- [unused-filename](https://github.com/sindresorhus/unused-filename) - Get an unused filename by appending a number if it exists: `file.txt` → `file (1).txt`
- [filenamify](https://github.com/sindresorhus/filenamify) - Convert a string to a valid safe foldername
