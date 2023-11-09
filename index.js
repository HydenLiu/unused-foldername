import path from 'node:path';
import {pathExists, pathExistsSync} from 'path-exists';
import escapeStringRegexp from 'escape-string-regexp';

export class MaxTryError extends Error {
	constructor(originalPath, lastTriedPath) {
		super('Max tries reached.');
		this.originalPath = originalPath;
		this.lastTriedPath = lastTriedPath;
	}
}

const parenthesesIncrementer = inputFoldername => {
	const match = inputFoldername.match(/^(?<foldername>.*)\((?<index>\d+)\)$/);
	let {foldername, index} = match ? match.groups : {foldername: inputFoldername, index: 0};
	foldername = foldername.trim();
	return [`${foldername}`, `${foldername} (${++index})`];
};

const incrementPath = (folderPath, incrementer) => {
	const dirname = path.dirname(folderPath);
	const [originalFoldername, incrementedFoldername] = incrementer(path.basename(folderPath));
	return [path.join(dirname, originalFoldername), path.join(dirname, incrementedFoldername)];
};

export const separatorIncrementer = separator => {
	const escapedSeparator = escapeStringRegexp(separator);

	return inputFoldername => {
		const match = new RegExp(`^(?<foldername>.*)${escapedSeparator}(?<index>\\d+)$`).exec(inputFoldername);
		let {foldername, index} = match ? match.groups : {foldername: inputFoldername, index: 0};
		return [`${foldername}`, `${foldername.trim()}${separator}${++index}`];
	};
};

export async function unusedFoldername(folderPath, {incrementer = parenthesesIncrementer, maxTries = Number.POSITIVE_INFINITY} = {}) {
	let tries = 0;
	let [originalPath] = incrementPath(folderPath, incrementer);
	let unusedPath = folderPath;

	/* eslint-disable no-await-in-loop, no-constant-condition */
	while (true) {
		if (!(await pathExists(unusedPath))) {
			return unusedPath;
		}

		if (++tries > maxTries) {
			throw new MaxTryError(originalPath, unusedPath);
		}

		[originalPath, unusedPath] = incrementPath(unusedPath, incrementer);
	}
	/* eslint-enable no-await-in-loop, no-constant-condition */
}

export function unusedFoldernameSync(folderPath, {incrementer = parenthesesIncrementer, maxTries = Number.POSITIVE_INFINITY} = {}) {
	let tries = 0;
	let [originalPath] = incrementPath(folderPath, incrementer);
	let unusedPath = folderPath;

	/* eslint-disable no-constant-condition */
	while (true) {
		if (!pathExistsSync(unusedPath)) {
			return unusedPath;
		}

		if (++tries > maxTries) {
			throw new MaxTryError(originalPath, unusedPath);
		}

		[originalPath, unusedPath] = incrementPath(unusedPath, incrementer);
	}
	/* eslint-enable no-constant-condition */
}
