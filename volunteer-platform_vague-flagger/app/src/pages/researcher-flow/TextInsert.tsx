import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { SelectDropdown } from '../../components/SelectDropdown';
import { Annotation, formattedAnnotationType } from '../../types/Annotation';
import { HelperUser } from '../../types/HelperUser';
import { AssistanceInfo, AssistanceType, VIPUser } from '../../types/VIPUser';
import { analyzeText } from '../../utils/analyzeText';
import { assistanceTypeOptions } from '../vip-flow/VIPAdditionalInfo';

const socket = io(process.env.REACT_APP_BACKEND_ENDPOINT!);

export function TextInsertPage() {
	const location = useLocation();

	const { vip, helper } = location.state as { vip: VIPUser; helper: HelperUser };

	const [annotations, setAnnotations] = useState<Annotation[]>([]);
	const [flagged, setFlagged] = useState<{ idx: number; phrase: string }[]>([]);

	const [sessionFinished, setSessionFinishedStatus] = useState(false);

	// Restart Modal
	const [showRestartModal, setRestartModalVisibility] = useState(false);
	const [assistanceTypeOption, setAssistanceTypeOption] = useState(-1);

	function addFlaggedPhrase(idx: number, phrase: string) {
		const updatedFlaggedPhrases = structuredClone(flagged);

		updatedFlaggedPhrases.push({ idx: idx, phrase: phrase });

		console.log('Phrase Flagged. Flagged Phrases:', updatedFlaggedPhrases);

		setFlagged(updatedFlaggedPhrases);
	}

	function filterFlaggedAnnotations(_annotations: Annotation[], flaggedPhrases?: { idx: number; phrase: string }[]): Annotation[] {
		return [..._annotations].filter((e) => {
			const definedFlaggedPhrases = flaggedPhrases ?? flagged;

			for (let i = 0; i < definedFlaggedPhrases.length; i++) {
				console.log(definedFlaggedPhrases[i].idx, e.idx, definedFlaggedPhrases[i].phrase.toLowerCase(), e.phraseToCorrect.toLowerCase());
				if (definedFlaggedPhrases[i].idx === e.idx && definedFlaggedPhrases[i].phrase.toLowerCase() === e.phraseToCorrect.toLowerCase()) {
					return false;
				}
			}

			return true;
		});
	}

	useEffect(() => {
		socket.on('finish-session-client', () => {
			setSessionFinishedStatus(true);
		});
	});

	// Editor
	return (
		<div id='textInsertPage'>
			<h2>
				Session: {vip.name} (VIP) & {helper.name} (Helper)
			</h2>
			<div id='textAreaContainer'>
				<textarea
					onChange={(e) => {
						const updatedAnnotations = filterFlaggedAnnotations(analyzeText((e.target as HTMLTextAreaElement).value));

						setAnnotations(updatedAnnotations);

						socket.emit('text-update', JSON.stringify({ text: (e.target as HTMLTextAreaElement).value, annotations: updatedAnnotations }));
					}}
				></textarea>
			</div>
			<div id='annotationListContainer'>
				<div id='annotationListHeader'>
					<img
						onPointerDown={() => {
							const textArea = document.querySelector('textarea')!;

							const updatedAnnotations = filterFlaggedAnnotations(analyzeText(textArea.value), []);

							setFlagged([]);
							setAnnotations(updatedAnnotations);

							socket.emit('text-update', JSON.stringify({ text: textArea.value, annotations: updatedAnnotations }));
						}}
						src='https://www.freeiconspng.com/thumbs/restart-icon/black-panel-restart-system-icon--6.png'
						alt='Reset Annotation Flags'
						title='Reset Annotation Flags'
					/>
					<h3>Annotations</h3>
					{annotations.length > 0 ? (
						<img
							onPointerDown={() => {
								const textArea = document.querySelector('textarea')!;

								if (annotations.length === 0) return;

								var textAreaContents = textArea.value;

								var regex = new RegExp('\\b' + annotations[0].phraseToCorrect + '\\b', 'i');
								var idx = textAreaContents.search(regex);

								textArea.focus();
								textArea.selectionStart = idx;
								textArea.selectionEnd = idx + annotations[0].phraseToCorrect.length;
							}}
							src='https://cdn.pixabay.com/photo/2019/04/08/20/26/pencil-4112898_1280.png'
							alt='First Annotation'
							title='First Annotation'
						/>
					) : (
						''
					)}
				</div>
				<div id='annotationsWrapper'>
					{annotations.map((annotation, idx) => {
						return (
							<div className='annotation' key={idx}>
								<p>{`${formattedAnnotationType(annotation.type, true)}: ${annotation.message}.`}</p>
								<p>{` Word/Phrase: ${annotation.phraseToCorrect}`}</p>
								<img
									onPointerDown={() => {
										addFlaggedPhrase(annotation.idx, annotation.phraseToCorrect);

										const updatedFlaggedPhrases = [...flagged];
										updatedFlaggedPhrases.push({ idx: annotation.idx, phrase: annotation.phraseToCorrect });

										const updatedAnnotations = filterFlaggedAnnotations(annotations, updatedFlaggedPhrases);
										setAnnotations(updatedAnnotations);

										socket.emit('text-update', JSON.stringify({ text: document.querySelector('textarea')!.value, annotations: updatedAnnotations }));
									}}
									src='https://cdn2.iconfinder.com/data/icons/flat-ui-icons-24-px/24/cross-24-512.png'
									alt='Remove correction/clarification'
									title='Remove correction/clarification'
								/>
							</div>
						);
					})}
				</div>
			</div>
			<div id='finishSessionButtonContainer'>
				{sessionFinished ? (
					'Session Finished!'
				) : (
					<div>
						<Button
							variant='contained'
							onPointerDown={() => {
								setRestartModalVisibility(true);
							}}
						>
							Restart Session
						</Button>
						<Button
							variant='contained'
							onPointerDown={() => {
								socket.emit('finish-session', JSON.stringify({ text: document.querySelector('textarea')!.value }));
							}}
						>
							Finish Session
						</Button>
					</div>
				)}
			</div>
			<div id='restartSessionModalContainer' className={showRestartModal ? '' : 'hidden'}>
				<div id='restartSessionModal'>
					<h3>Restart Session Confirmation</h3>
					<SelectDropdown
						label='Assistance Type'
						options={assistanceTypeOptions}
						onChange={(e: any) => setAssistanceTypeOption(e.target.value)}
						selectedOption={assistanceTypeOption}
						centerDropdown={true}
					/>
					<div>
						<Button
							variant='contained'
							onPointerDown={() => {
								// Clear textarea
								document.querySelector('textarea')!.value = '';

								setAnnotations([]);
								setFlagged([]);

								const modifiedVIP = new VIPUser(
									vip.name,
									vip.assistanceTool,
									new AssistanceInfo(vip.assistanceInfo!.timeCommitment, assistanceTypeOption as AssistanceType, vip.assistanceInfo!.moreInfo)
								);

								socket.emit('reset-session', JSON.stringify({ vip: modifiedVIP, helper: helper }));

								setRestartModalVisibility(false);
							}}
						>
							Confirm Assistance Type
						</Button>
						<Button variant='contained' onPointerDown={() => setRestartModalVisibility(false)}>
							Cancel
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
