import { Button } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { ScratchpadHeader } from '../../components/ScratchpadHeader';
import { HelperUser } from '../../types/HelperUser';
import { AssistanceType, VIPUser } from '../../types/VIPUser';

let init = false;

const socket = io(process.env.REACT_APP_BACKEND_ENDPOINT!);

export function GettingStarted() {
	const location = useLocation();
	const navigate = useNavigate();

	const { vip, helper, isVIP } = location.state as { vip: VIPUser; helper: HelperUser; isVIP: boolean };

	if (!init) {
		socket.on('reset-session-client', (stringifiedVIPHelperObj) => {
			const { vip: eventVIP, helper: eventHelper } = JSON.parse(stringifiedVIPHelperObj) as { vip: VIPUser; helper: HelperUser };

			navigate('/scratchpad', { state: { vip: eventVIP, helper: eventHelper, isVIP: isVIP } });
		});

		init = true;
	}

	return (
		<div id='gettingStartedPageWrapper'>
			<ScratchpadHeader title={`${vip.assistanceInfo!.assistanceType === AssistanceType.SightedGuidance ? 'Sighted Guidance' : 'Getting Started'}`}></ScratchpadHeader>
			{renderInstructions(vip.assistanceInfo!.assistanceType)}
			{vip.assistanceInfo!.assistanceType !== AssistanceType.SightedGuidance ? (
				<div id='buttonContainer'>
					<Button
						variant='contained'
						onPointerDown={() => {
							navigate('/scratchpad/scratchpad', { state: { vip: vip, helper: helper, isVIP: isVIP } });
						}}
					>
						Open Notepad
					</Button>
				</div>
			) : (
				''
			)}
		</div>
	);
}

function renderInstructions(assistanceType: AssistanceType): JSX.Element {
	switch (assistanceType) {
		case AssistanceType.Descriptions:
			return (
				<div id='bestPracticeNotes'>
					<p>Best Practice for Description</p>
					<ul>
						<li>
							<span>Mention the shape and size of the room when possible</span> so VIPs can have an idea of the potential layout of the room
						</li>
						<li>
							<span>Highlight fixed major features in the room</span>. For example, an information desk, a sculpture in the middle of the room, or a group of chairs for seating.
						</li>
						<li>
							Make sure to <span>mention the position of any objects you're describing</span>; knowing where and how far an object is can be helpful for VIPs
						</li>
						<li>
							<span>Call attention to any edges or walls</span> the VIP can use when exploring. These physical boundaries can help VIPs understand the space's layout as they're walking.
						</li>
						<li>
							<span>Always alert the VIP of potential obstacles/dangers</span> in their path. This should include stairs, drops, and anything protruding from the ceiling or wall.
						</li>
					</ul>
				</div>
			);

		case AssistanceType.Directions:
			return (
				<div id='bestPracticeNotes'>
					<p>Best Practice for Directions</p>
					<ul>
						<li>
							<span>Make sure to verbally describe the directions</span> you're sharing; don't point or only use gestures.{' '}
						</li>
						<li>
							Make sure to <span>verbally support your physical gestures</span> (say “yes” or “no” instead of just nodding your head)
						</li>
						<li>
							<span>Use specific counts</span> e.g. “it is the fourth door” or “5 feet ahead of you”
						</li>
						<li>
							<span>Use Left/Right as orienting cues</span>. Avoid describing places in terms of North/South/East/West{' '}
						</li>
						<li>
							<span>Describe directions from the VIP's perspective</span>, not your own (e.g. “you are facing the entrance, the hallway is to your left”)
						</li>
						<li>
							<span>Use consistently present items as reference points</span> so VIPs can verify their location
						</li>
						<li>
							<span>Always alert the VIP of potential obstacles/dangers</span> in their path. This should include stairs, drops, and anything protruding from the ceiling or wall.
						</li>
					</ul>
				</div>
			);

		case AssistanceType.SightedGuidance:
			return (
				<div id='bestPracticeNotesSightedGuidance'>
					<p>Continue with Wearable UI Prototype</p>
				</div>
			);
	}
}
