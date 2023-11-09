import {expectType} from 'tsd';
import {unusedFoldername, unusedFoldernameSync, MaxTryError} from './index.js';

expectType<Promise<string>>(unusedFoldername('rainbow'));
expectType<string>(unusedFoldernameSync('rainbow'));

let error: unknown;
if (error instanceof MaxTryError) {
	expectType<string>(error.lastTriedPath);
}
