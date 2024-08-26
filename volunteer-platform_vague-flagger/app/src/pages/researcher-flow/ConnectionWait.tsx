import { CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { HelperUser } from '../../types/HelperUser';
import { VIPUser } from '../../types/VIPUser';

const socket = io(process.env.REACT_APP_BACKEND_ENDPOINT!);

export function ConnectionWaitPage() {
	const navigate = useNavigate();

	socket.on('helper-vip-match', (stringifiedVIPHelperObj: string) => {
		const { vip, helper } = JSON.parse(stringifiedVIPHelperObj) as { vip: VIPUser; helper: HelperUser };

		navigate('./text-insert', { state: { vip: vip, helper: helper } });
	});

	return (
		<div id='connectionWaitPage'>
			<p>Waiting for VIP/Helper connection...</p>
			<CircularProgress />
		</div>
	);
}
