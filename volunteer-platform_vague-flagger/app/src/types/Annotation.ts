export class Annotation {
	type: AnnotationType;
	message: string;
	phraseToCorrect: string;
	idx: number;

	constructor(type: AnnotationType, message: string, phraseToCorrect: string, idx: number) {
		this.type = type;
		this.message = message;
		this.phraseToCorrect = phraseToCorrect;
		this.idx = idx;
	}
}

export enum AnnotationType {
	Correction,
	Clarification
}

export function formattedAnnotationType(annotationType: AnnotationType, caps = false) {
	switch (annotationType) {
		case AnnotationType.Correction:
			return caps ? 'Correction' : 'correction';
		case AnnotationType.Clarification:
			return caps ? 'Clarification' : 'clarification';
	}
}
