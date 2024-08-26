import { FormControl } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { SelectDropdown } from '../../components/SelectDropdown';
import { validateForm } from '../../utils/validateForm';
import { io } from 'socket.io-client';
import { HelperUser, Purpose, Vicinity } from '../../types/HelperUser';

const proximityOptions = [
	{ value: 0, name: 'Regularly' },
	{ value: 1, name: 'Sometimes' },
	{ value: 2, name: 'First Time' }
];

const purposeOptions = [
	{ value: 0, name: 'Working' },
	{ value: 1, name: 'Visiting' }
];

const socket = io(process.env.REACT_APP_BACKEND_ENDPOINT!);

export function HelperUserInformation() {
	const [name, setName] = useState('');

	const [proximityOption, setProximityOption] = useState(-1);
	const [purposeOption, setPurposeOption] = useState(-1);

	const navigate = useNavigate();

	return (
		<div id='helperUserInformationWrapper' className='information-page-wrapper'>
			<Header title='User Information' subtext='Helper' />
			<div className='form-control'>
				<FormControl>
					<div className='input-wrapper'>
						<p>What is your first name?</p>
						<Input label='First Name' required={true} onEdit={(e: any) => setName(e)} />
					</div>
					<div className='dropdown-wrapper'>
						<p>How often are you in the area?</p>
						<SelectDropdown options={proximityOptions} label='Proximity' onChange={(e: any) => setProximityOption(e.target.value)} selectedOption={proximityOption} />
					</div>
					<div className='dropdown-wrapper'>
						<p>Are you working or visiting in this area?</p>
						<SelectDropdown options={purposeOptions} label='Purpose' onChange={(e: any) => setPurposeOption(e.target.value)} selectedOption={purposeOption} />
					</div>
				</FormControl>
			</div>
			<div
				className='large-next-button'
				onPointerDown={() => {
					if (validateForm(document.getElementById('helperUserInformationWrapper') as HTMLElement)) {
						const helperObj = new HelperUser(name, proximityOption as Vicinity, purposeOption as Purpose);

						socket.emit('new-helper', JSON.stringify(helperObj));

						//Navigate to next page
						navigate('/helper/wait-screen', { state: { helperID: helperObj.id } });
					}
				}}
			>
				<h2>Next</h2>
			</div>
		</div>
	);
}
