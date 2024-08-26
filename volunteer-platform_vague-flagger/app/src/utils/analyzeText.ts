import { Annotation, AnnotationType } from '../types/Annotation';

const vagueWords = [
	'some',
	'a',
	'all',
	'several',
	'here',
	'end',
	'between',
	'close',
	'near',
	'over',
	'maybe',
	'kinda',
	'kind',
	"don't",
	'unsure',
	'not',
	'left',
	'right',
	'ahead',
	'behind',
	'in',
	'next',
	'red',
	'blue',
	'orange',
	'gray',
	'white',
	'black',
	'yellow',
	'green',
	'pink',
	'purple',
	'brown',
	'straight'
];

export const followUpWords = new Map([
	['a', ['few', 'bit', 'couple']],
	['close', ['to']],
	['over', ['there']],
	["don't", ['know']],
	['in', ['front']],
	['next', ['to']],
	['kind', ['of']],
	['not', ['sure']]
]);

export function analyzeText(text: string): Annotation[] {
	const words = text.split(/\n| /); // Splits words by spaces (" ") & line breaks ("\n")
	let lastWordPartOfPhrase = false;

	let annotations: Annotation[] = [];

	console.log('Words:', words);

	for (let i = 0; i < words.length; i++) {
		const word = removePunctuation(words[i]);
		const lowercaseWord = word.toLowerCase();

		if (lastWordPartOfPhrase) {
			lastWordPartOfPhrase = false;
			continue;
		}
		if (!vagueWords.includes(lowercaseWord)) continue;

		// This code only runs if it is a vague word and if the last word wasn't part of a phrase.

		if (Array.from(followUpWords.keys()).includes(lowercaseWord)) {
			// If current word has a follow-up word
			const nextWord = removePunctuation(words[i + 1] ?? undefined);

			if (nextWord === undefined) continue;

			const lowercaseNextWord = nextWord.toLowerCase();

			if ((followUpWords.get(lowercaseWord) ?? []).includes(lowercaseNextWord)) {
				const phrase = word + ' ' + nextWord;

				const { type, message } = getAnnotationInfo(phrase);

				const idx = getIndicesOfWord(text, phrase)[occurrenceOfPhraseInAnnotations(annotations, phrase, i)];

				annotations.push(new Annotation(type, message, phrase, idx));

				lastWordPartOfPhrase = true;
			}
		} else {
			const { type, message } = getAnnotationInfo(word);

			const idx = getIndicesOfWord(text, word)[occurrenceOfPhraseInAnnotations(annotations, word, i)];
			annotations.push(new Annotation(type, message, word, idx));
		}
	}

	return annotations;
}

function getIndicesOfWord(string: string, phrase: string) {
	var re = new RegExp('\\b' + phrase + '\\b', 'gi');

	var results = []; //this is the results you want
	while (re.exec(string)) {
		results.push(re.lastIndex);
	}

	return results;
}

function occurrenceOfPhraseInAnnotations(annotations: Annotation[], phrase: string, idx: number) {
	let occurrence = 0;

	for (let i = 0; i < idx; i++) {
		if (annotations[i]?.phraseToCorrect === phrase) occurrence++;
	}

	return occurrence;
}

function removePunctuation(word: string): string {
	const punctuationlessWord = word
		?.toLowerCase()
		.replace(/[.,/#!$%^&*;:{}=-_`~()]/g, '')
		.replace(/s{2,}/g, ' ');

	return punctuationlessWord;
}

function getAnnotationInfo(phrase: string): { type: AnnotationType; message: string } {
	const lowercasePhrase = phrase.toLowerCase();

	switch (lowercasePhrase) {
		case 'some':
		case 'a few':
		case 'a bit':
		case 'a couple':
		case 'all':
		case 'several':
			return { type: AnnotationType.Correction, message: 'Provide an exact count or measurement when you can' };
		case 'there':
		case 'here':
		case 'end':
		case 'between':
		case 'close to':
		case 'near':
		case 'over there':
			return { type: AnnotationType.Correction, message: 'Use reference points and exact language when describing position' };
		case 'maybe':
		case 'kinda':
		case 'kind of':
		case "don't know":
		case 'unsure':
		case 'not sure':
			return { type: AnnotationType.Clarification, message: 'Use exact language for this if you can' };
		case 'left':
		case 'right':
		case 'ahead':
		case 'behind':
		case 'in front':
		case 'next to':
			return { type: AnnotationType.Clarification, message: 'Check that your directions are from your collaborator’s perspective' };
		case 'red':
		case 'blue':
		case 'orange':
		case 'gray':
		case 'white':
		case 'black':
		case 'yellow':
		case 'green':
		case 'pink':
		case 'purple':
		case 'brown':
			return { type: AnnotationType.Correction, message: 'Use non-color descriptors' };
		case 'straight':
			return { type: AnnotationType.Clarification, message: 'Is there an edge or wall they can reference as they move towards this point?' };
		default:
			return { type: AnnotationType.Correction, message: `Unknown phrase: ${lowercasePhrase}` };
	}
}
