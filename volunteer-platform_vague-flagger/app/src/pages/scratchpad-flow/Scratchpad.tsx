import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { ScratchpadHeader } from '../../components/ScratchpadHeader';
import { Annotation, AnnotationType } from '../../types/Annotation';
import { HelperUser } from '../../types/HelperUser';
import { VIPUser } from '../../types/VIPUser';

let init = false;

export function Scratchpad() {
	const [text, setText] = useState<string[]>([]);
	const [annotations, setAnnotations] = useState<Annotation[]>([]);

	const location = useLocation();
	const navigate = useNavigate();

	const { isVIP } = location.state as { vip: VIPUser; helper: HelperUser; isVIP: boolean };

	useEffect(() => {
		if (!init) {
			const socket = io(process.env.REACT_APP_BACKEND_ENDPOINT!);

			socket.on('text-update-client', (stringifiedTextAnnotationsObj) => {
				const { text: updatedText, annotations: updatedAnnotations } = JSON.parse(stringifiedTextAnnotationsObj) as { text: string; annotations: Annotation[] };

				setAnnotations(updatedAnnotations);

				setText(highlightPhrase(updatedText, updatedAnnotations[0]?.phraseToCorrect ?? '-1'));
			});

			socket.on('finish-session-client', (stringifiedTextObj) => {
				const finalizedText = JSON.parse(stringifiedTextObj);

				navigate('/scratchpad/notes', { state: { text: finalizedText } });
			});

			socket.on('reset-session-client', (stringifiedVIPHelperObj) => {
				const { vip: eventVIP, helper: eventHelper } = JSON.parse(stringifiedVIPHelperObj) as { vip: VIPUser; helper: HelperUser };

				navigate('/scratchpad', { state: { vip: eventVIP, helper: eventHelper, isVIP: isVIP } });
			});

			init = true;
		}
	});

	return (
		<div id='scratchpad'>
			<ScratchpadHeader title='Notepad' />
			<div id='scratchpadText'>
				{text.map((e, idx) => {
					if (e.includes('<span>')) {
						const innerText = e.replace('<span>', '').replace('</span>', '');

						return (
							<span id='highlighted' key={idx}>
								{innerText}
							</span>
						);
					}

					return <p key={idx}>{e}</p>;
				})}
			</div>
			<div id='scratchpadDivider'>
				<hr />
			</div>
			<div id='annotationFeedback' className={annotations.length > 0 ? '' : 'hidden'}>
				<h3>{annotations[0]?.type === AnnotationType.Correction ? 'Please revise:' : 'Suggestion:'}</h3>
				{annotations[0]?.message ?? ''}
			</div>
		</div>
	);
}

function highlightPhrase(text: string, phrase: string): string[] {
	if (phrase === '-1') {
		console.log('-1!');
		return text.split(' ');
	}

	var regex = new RegExp('\\b' + phrase + '\\b', 'i');

	const startIdx = text.search(regex);
	const endIdx = startIdx + phrase.length;

	const originalPhrase = text.substring(startIdx, endIdx);

	text = text.slice(0, startIdx) + `<span>${originalPhrase}</span>` + text.slice(endIdx);

	const splitArray = text.split(' ');

	let idxToDelete = -1;
	for (let i = 0; i < splitArray.length; i++) {
		const word = splitArray[i];

		if (word.includes('<span>') && !word.includes('</span>')) {
			if (splitArray[i + 1]?.includes('</span>')) {
				splitArray[i] = splitArray[i] + ' ' + splitArray[i + 1];
				idxToDelete = i + 1;
			}
		}
	}

	if (idxToDelete !== -1) splitArray.splice(idxToDelete, 1);

	console.log('Split Array:', splitArray);

	//ex: in front

	// ['word', '<span>in' 'front</span>']

	// Remove phrase from string.
	// Insert <span>phrase</span> at the original starting index of the phrase.

	return splitArray;
}
