import { Button, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { HelperUser } from '../../types/HelperUser';
import { AssistanceType, formattedAssistanceType, VIPUser } from '../../types/VIPUser';

let init = false;

export function HelperWaitScreen() {
	const socket = io(process.env.REACT_APP_BACKEND_ENDPOINT!);
	const location = useLocation();
	const navigate = useNavigate();

	const { helperID } = location.state as { helperID: string };

	const [vip, setVIP] = useState<VIPUser>();
	const [helper, setHelper] = useState<HelperUser>();

	const [matchedWithOther, setMatchedWithOther] = useState(false);

	useEffect(() => {
		if (!init) {
			socket.on('notify-helper', (stringifiedVIPHelperObj) => {
				const { vip: eventVIP, helper: eventHelper } = JSON.parse(stringifiedVIPHelperObj);

				setVIP(eventVIP);
				setHelper(eventHelper);
			});

			socket.on('helper-vip-match', (stringifiedVIPHelperObj) => {
				const { vip: eventVIP, helper: eventHelper } = JSON.parse(stringifiedVIPHelperObj);

				if (eventHelper.id === helperID) {
					console.log('Match!', eventHelper.id, helperID);

					navigate('/scratchpad', { state: { vip: eventVIP, helper: eventHelper, isVIP: false } });
				} else setMatchedWithOther(true);
			});

			init = true;
		}
	});

	return (
		<div id='waitScreen'>
			{vip === undefined ? (
				<div id='helperWaitScreenLoadingPage'>
					<p>Thank you! When a VIP needs your help, you will be notified promptly.</p>
					<CircularProgress />
				</div>
			) : (
				<div id='vipAcceptPrompt'>
					<p>
						{matchedWithOther
							? `${vip.name} has been matched with another helper.`
							: `
							${vip.name} is seeking ${formattedAssistanceType(vip.assistanceInfo?.assistanceType ?? AssistanceType.Descriptions)} for ${vip.assistanceInfo?.timeCommitment ?? 5}${' '}
							${getCorrectNoun(vip.assistanceInfo?.timeCommitment ?? 5)}, and is using a ${vip.assistanceTool}.`}
					</p>
					{matchedWithOther ? (
						''
					) : (
						<Button
							variant='contained'
							onPointerDown={() => {
								socket.emit('helper-approve-request', JSON.stringify({ vip: vip, helper: helper }));
							}}
						>
							Accept Request
						</Button>
					)}
				</div>
			)}
		</div>
	);
}

function getCorrectNoun(minutes: number) {
	if (minutes > 1 || minutes === 0) return 'minutes';

	return 'minute';
}
