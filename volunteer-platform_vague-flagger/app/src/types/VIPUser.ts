import { generateID } from '../utils/generateID';

export class VIPUser {
	name: string;
	assistanceTool: string;
	assistanceInfo?: AssistanceInfo;
	id: string;

	constructor(name: string, assistanceTool: string, assistanceInfo?: AssistanceInfo) {
		this.name = name;
		this.assistanceTool = assistanceTool;
		this.assistanceInfo = assistanceInfo;
		this.id = generateID();
	}
}

export class AssistanceInfo {
	/** The time commitment for assistance (minutes) */
	timeCommitment: number;
	assistanceType: AssistanceType;
	moreInfo: string;

	constructor(timeCommitment: number, assistanceType: AssistanceType, moreInfo: string) {
		this.timeCommitment = timeCommitment;
		this.assistanceType = assistanceType;
		this.moreInfo = moreInfo;
	}
}

export enum AssistanceType {
	SightedGuidance,
	Directions,
	Descriptions
}

export function formattedAssistanceType(assistanceType: AssistanceType, caps = false) {
	switch (assistanceType) {
		case AssistanceType.SightedGuidance:
			return caps ? 'Sighted Guidance (Hands-on)' : 'sighted guidance (hands-on)';
		case AssistanceType.Directions:
			return caps ? 'Directions' : 'directions';
		case AssistanceType.Descriptions:
			return caps ? 'Descriptions' : 'descriptions';
	}
}
