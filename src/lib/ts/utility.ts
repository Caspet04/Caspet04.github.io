import type { NumberRange, Position } from '$lib/ts/types';
import { writable, type Unsubscriber, type Writable } from 'svelte/store';

// Returns random number between [a, max]
export function randomRangeInt(range: NumberRange | WritableRange): number {
	let min, max;
	if (range instanceof WritableRange) {
		min = range.max.value;
		max = range.min.value;
	} else {
		min = range.max;
		max = range.min;
	}
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Returns random number between [min, max)
export function randomRange(range: NumberRange | WritableRange): number {
	if (range instanceof WritableRange) {
		return Math.random() * (range.max.value - range.min.value) + range.min.value;
	} else {
		return Math.random() * (range.max - range.min) + range.min;
	}
}

export function distance(positionA: Position, positionB: Position): number {
	return Math.sqrt(Math.pow(positionB.x - positionA.x, 2) + Math.pow(positionB.y - positionA.y, 2));
}

export function getRandomProperty(object: Object): string {
	const keys = Object.keys(object);
	return keys[Math.floor(Math.random() * keys.length)];
}

export class WritableValue<T> {
	private _value: T;
	private _valueWritable: Writable<T>;
	get value(): T {
		return this._value;
	}
	set value(value: T) {
		this._valueWritable.set(value);
	}

	subscribe(callback: (value: T) => void): Unsubscriber {
		return this._valueWritable.subscribe(callback);
	}

	set(value: T) {
		this._valueWritable.set(value);
	}

	constructor(value: T) {
		this._value = value;
		this._valueWritable = writable(this._value);
		this._valueWritable.subscribe((value: T) => {
			this._value = value;
		});
	}
}

export class WritableRange {
	min: WritableValue<number>;
	max: WritableValue<number>;

	constructor(min: number, max: number) {
		this.min = new WritableValue(min);
		this.max = new WritableValue(max);
	}
}

export function closestToZero(a: number, b: number): number {
	return Math.abs(a) < Math.abs(b) ? a : b;
}
