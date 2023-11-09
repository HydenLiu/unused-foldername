import path from 'node:path';
import test from 'ava';
import {unusedFoldername, unusedFoldernameSync, separatorIncrementer, MaxTryError} from './index.js';

const fixturePath = folder => path.join('fixtures', folder);
const underscore = {incrementer: separatorIncrementer('_')};
const dash = {incrementer: separatorIncrementer('-')};

test('async', async t => {
	t.is(await unusedFoldername(fixturePath('noop')), fixturePath('noop'));
	t.is(await unusedFoldername(fixturePath('unicorn')), fixturePath('unicorn (1)'));
	t.is(await unusedFoldername(fixturePath('rainbow')), fixturePath('rainbow (3)'));
});

test('async - maxTries option', async t => {
	const error = await t.throwsAsync(async () => {
		await unusedFoldername(fixturePath('rainbow (1)'), {maxTries: 1});
	}, {instanceOf: MaxTryError});

	t.is(error.originalPath, fixturePath('rainbow'));
	t.is(error.lastTriedPath, fixturePath('rainbow (2)'));
});

test('async - incrementer option', async t => {
	t.is(await unusedFoldername(fixturePath('noop'), underscore), fixturePath('noop'));
	t.is(await unusedFoldername(fixturePath('unicorn'), underscore), fixturePath('unicorn_1'));
	t.is(await unusedFoldername(fixturePath('rainbow'), underscore), fixturePath('rainbow_3'));
	t.is(await unusedFoldername(fixturePath('rainbow'), dash), fixturePath('rainbow-2'));
});

test('sync', t => {
	t.is(unusedFoldernameSync(fixturePath('noop')), fixturePath('noop'));
	t.is(unusedFoldernameSync(fixturePath('unicorn')), fixturePath('unicorn (1)'));
	t.is(unusedFoldernameSync(fixturePath('rainbow')), fixturePath('rainbow (3)'));
});

test('sync - maxTries option', t => {
	const error = t.throws(() => {
		unusedFoldernameSync(fixturePath('rainbow (1)'), {maxTries: 1});
	}, {instanceOf: MaxTryError});

	t.is(error.originalPath, fixturePath('rainbow'));
	t.is(error.lastTriedPath, fixturePath('rainbow (2)'));
});

test('sync - incrementer option', t => {
	t.is(unusedFoldernameSync(fixturePath('noop'), underscore), fixturePath('noop'));
	t.is(unusedFoldernameSync(fixturePath('unicorn'), underscore), fixturePath('unicorn_1'));
	t.is(unusedFoldernameSync(fixturePath('rainbow'), underscore), fixturePath('rainbow_3'));
	t.is(unusedFoldernameSync(fixturePath('rainbow'), dash), fixturePath('rainbow-2'));
});
