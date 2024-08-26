import { generateID } from '../utils/generateID';

export class HelperUser {
	name: string;
	vicinity: Vicinity;
	purpose: Purpose;
	id: string;

	constructor(name: string, vicinity: Vicinity, purpose: Purpose, fake = false) {
		this.name = name;
		this.vicinity = vicinity;
		this.purpose = purpose;
		this.id = fake ? 'fake' : generateID();
	}
}

export enum Vicinity {
	Regularly,
	Sometimes,
	FirstTime
}

export enum Purpose {
	Working,
	Visiting
}
