import { FormControl } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { SelectDropdown } from '../../components/SelectDropdown';
import { VIPUser } from '../../types/VIPUser';
import { validateForm } from '../../utils/validateForm';

const assistanceToolOptions = [
	{ value: 0, name: 'White Cane' },
	{ value: 1, name: 'Guide Dog' },
	{ value: 2, name: 'Other' }
];

export function VIPUserInformation() {
	const [name, setName] = useState('');
	const [assistanceToolOption, setAssistanceToolOption] = useState(-1);
	const [customAssistanceTool, setCustomAssistanceTool] = useState('Other');

	const navigate = useNavigate();

	return (
		<div id='vipUserInformationWrapper' className='information-page-wrapper'>
			<Header title='User Information' subtext='VIP' />
			<div className='form-control'>
				<FormControl>
					<div className='input-wrapper'>
						<p>What is your first name?</p>
						<Input label='First Name' required={true} onEdit={(e: any) => setName(e)} />
					</div>
					<div className='dropdown-wrapper'>
						<p>Do you use any tools for assistance?</p>
						<SelectDropdown label='Assistance Tools' options={assistanceToolOptions} onChange={(e: any) => setAssistanceToolOption(e.target.value)} selectedOption={assistanceToolOption} />
					</div>
					{assistanceToolOption === 2 ? <Input label='Assistive Tool' required={false} onlyAllowLetters={false} onEdit={(e: any) => setCustomAssistanceTool(e)} /> : <></>}
				</FormControl>
			</div>
			<button
				className='large-next-button'
				onPointerDown={() => {
					if (validateForm(document.getElementById('vipUserInformationWrapper') as HTMLElement)) {
						const chosenAssistanceTool = assistanceToolOptions[assistanceToolOption].name;
						const vip = new VIPUser(name, chosenAssistanceTool === 'Other' ? customAssistanceTool : chosenAssistanceTool);

						//Navigate to next page
						navigate('/vip/additional-info', { state: { vip: vip } });
					}
				}}
			>
				<h2>Next</h2>
			</button>
		</div>
	);
}
