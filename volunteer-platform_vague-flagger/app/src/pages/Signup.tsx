import { LinkButton } from '../components/LinkButton';

export function Signup() {
	return (
		<div id='signupWrapper'>
			<div>
				<p>Are you a visually impaired person (VIP) needing assistance? Click the button below:</p>
				<LinkButton textContent='VIP User' targetPath='vip'></LinkButton>
			</div>
			<div>
				<p>Are you a sighted person looking to assist a VIP? Click the button below:</p>
				<LinkButton textContent='Helper User' targetPath='helper'></LinkButton>
			</div>
		</div>
	);
}
