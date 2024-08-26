import { FormControl } from '@mui/material';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { SelectDropdown } from '../../components/SelectDropdown';
import { AssistanceInfo, AssistanceType, VIPUser } from '../../types/VIPUser';
import { validateForm } from '../../utils/validateForm';

const timeCommitmentOptions = [
	{ value: 0, name: '1 minute' },
	{ value: 1, name: '5 minutes' },
	{ value: 2, name: '10 minutes' }
];

export const assistanceTypeOptions = [
	{ value: 0, name: 'Sighted Guidance (Hands-on)' },
	{ value: 1, name: 'Directions to find something' },
	{ value: 2, name: 'Descriptions of the space' }
];

export function VIPAdditionalInfo() {
	const location = useLocation();
	const navigate = useNavigate();

	const [additionalInfo, setAdditionalInfo] = useState('');
	const [timeCommitmentOption, setTimeCommitment] = useState(-1);
	const [assistanceTypeOption, setAssistanceTypeOption] = useState(-1);

	const { vip } = location.state as { vip: VIPUser };

	return (
		<div id='vipUserInformationWrapper' className='information-page-wrapper'>
			<Header title='Additional Information' subtext='VIP' />
			<div className='form-control'>
				<FormControl>
					<div className='dropdown-wrapper'>
						<p>What is the approximate time commitment?</p>
						<SelectDropdown label='Time Commitment' options={timeCommitmentOptions} onChange={(e: any) => setTimeCommitment(e.target.value)} selectedOption={timeCommitmentOption} />
					</div>
					<div className='dropdown-wrapper'>
						<p>What type of assistance do you need?</p>
						<SelectDropdown label='Assistance Type' options={assistanceTypeOptions} onChange={(e: any) => setAssistanceTypeOption(e.target.value)} selectedOption={assistanceTypeOption} />
					</div>
					<h5>
						<i>More Information (Optional):</i>
					</h5>
					<Input label='Additional Information' multiline={true} required={false} onEdit={(e: any) => setAdditionalInfo(e)} onlyAllowLetters={false} />
				</FormControl>
			</div>
			<button
				className='large-next-button'
				onPointerDown={() => {
					if (validateForm(document.getElementById('vipUserInformationWrapper') as HTMLElement)) {
						vip.assistanceInfo = new AssistanceInfo(parseInt(timeCommitmentOptions[timeCommitmentOption].name.charAt(0)) ?? 1, assistanceTypeOption as AssistanceType, additionalInfo);

						//Navigate to next page
						navigate('/vip/dashboard', { state: { vip: vip } });
					}
				}}
			>
				<h2>Request Assistance</h2>
			</button>
		</div>
	);
}
