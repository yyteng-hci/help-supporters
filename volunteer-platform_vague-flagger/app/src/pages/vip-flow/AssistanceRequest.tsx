import { CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HelperUser, Purpose, Vicinity } from '../../types/HelperUser';
import { io } from 'socket.io-client';
import { VIPUser } from '../../types/VIPUser';

let renders = 0;

const socket = io(process.env.REACT_APP_BACKEND_ENDPOINT!);

export function AssistanceRequest() {
	const location = useLocation();
	const navigate = useNavigate();

	const { vip, helpers: selectedHelpers, allPossibleHelpers } = location.state as { vip: VIPUser; helpers: HelperUser[]; allPossibleHelpers: HelperUser[] };

	const [helperList, setHelperList] = useState<HelperUser[]>(selectedHelpers);

	//Make sure that helpers are only notified once
	useEffect(() => {
		if (renders === 0) {
			socket.emit('send-helper-requests', JSON.stringify({ vip: vip, helpers: helperList, allPossibleHelpers: allPossibleHelpers }));

			socket.on('helper-vip-match', (stringifiedVIPHelperObj: string) => {
				const { vip: eventVIP, helper: eventHelper } = JSON.parse(stringifiedVIPHelperObj) as { vip: VIPUser; helper: HelperUser };

				console.log('Match!', vip, eventVIP, eventHelper);

				if (vip.id === eventVIP.id) {
					navigate('/scratchpad', { state: { vip: eventVIP, helper: eventHelper, isVIP: true } });
				}
			});

			socket.on('helper-unavailable', (stringifiedHelperObject: string) => {
				const unavailableHelper: HelperUser = JSON.parse(stringifiedHelperObject);

				const filteredHelperList = [...helperList].filter((e) => e.id !== unavailableHelper.id);

				console.log('Unavailable helper: ', unavailableHelper);

				if (filteredHelperList.length !== helperList.length) setHelperList(filteredHelperList);
			});

			renders++;
		}
	});

	return (
		<div id='assistanceRequestLoadingPage'>
			<p>An assistance request has been sent to {getFormattedHelperList(helperList)}.</p>
			<br />
			<p>Waiting for response...</p>
			<CircularProgress />
		</div>
	);
}

// Returns a user-readable list of helpers that were requested ex. ["Aileen", "Victoria", "Brian"] -> "Aileen, Victoria, and Brian"
export function getFormattedHelperList(helpers: HelperUser[], extraDetails = false): string {
	const names = helpers.map((e) => e.name);

	if (names.length === 0) return 'No helpers requested. Please try again.';

	if (names.length === 1) return extraDetails ? addDetails(helpers[0]) : names[0];

	if (names.length === 2) return extraDetails ? `${addDetails(helpers[0])} and ${addDetails(helpers[1])}` : `${names[0]} and ${names[1]}`;

	let result = '';

	for (let i = 0; i < names.length - 1; i++) {
		result += extraDetails ? `${addDetails(helpers[i])}, ` : `${names[i]}, `;
	}

	result += extraDetails ? `and ${addDetails(helpers[names.length - 1])}` : `and ${names[names.length - 1]}`;

	return result;
}

function addDetails(helper: HelperUser) {
	return `${helper.name} (${readableVicinity(helper.vicinity)}, ${readablePurpose(helper.purpose)})`;
}

function readableVicinity(vicinity: Vicinity) {
	switch (vicinity) {
		case Vicinity.FirstTime:
			return 'First Time';
		case Vicinity.Regularly:
			return 'Regular Visitor';
		case Vicinity.Sometimes:
			return 'Visits Sometimes';
	}
}

function readablePurpose(purpose: Purpose) {
	switch (purpose) {
		case Purpose.Visiting:
			return 'Visiting';
		case Purpose.Working:
			return 'Working';
	}
}
