import { Button } from '@mui/material';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { HelperUser } from '../../types/HelperUser';
import { VIPUser } from '../../types/VIPUser';

const socket = io(process.env.REACT_APP_BACKEND_ENDPOINT!);

export function ScratchpadStartScreen() {
	const location = useLocation();
	const navigate = useNavigate();

	const { vip, helper, isVIP } = location.state as { vip: VIPUser; helper: HelperUser; isVIP: boolean };

	useEffect(() => {
		socket.on('start-session-client', () => {
			if (isVIP) navigate('/scratchpad/scratchpad', { state: { vip: vip, helper: helper, isVIP: isVIP } });
			else navigate('/scratchpad/getting-started', { state: { vip: vip, helper: helper, isVIP: isVIP } });
		});
	});

	return (
		<div id='scratchpadStartScreenWrapper'>
			<div>
				<div className='user-display'>
					<h1>{helper.name}</h1>
					<h4>Helper</h4>
				</div>
				<div className='user-display'>
					<h1>{vip.name}</h1>
					<h4>VIP</h4>
				</div>
			</div>
			<div>
				<p>Click 'Start' to begin your collaboration session:</p>
				<Button
					onPointerDown={() => {
						socket.emit('start-session');

						if (isVIP) navigate('/scratchpad/scratchpad', { state: { vip: vip, helper: helper, isVIP: isVIP } });
						else navigate('/scratchpad/getting-started', { state: { vip: vip, helper: helper, isVIP: isVIP } });
					}}
					variant='contained'
				>
					Start
				</Button>
			</div>
		</div>
	);
}
