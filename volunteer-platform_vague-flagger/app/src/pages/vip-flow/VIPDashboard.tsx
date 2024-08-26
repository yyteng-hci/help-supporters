import { List, ListItem, ListItemButton, ListItemIcon, Checkbox, ListItemText, CircularProgress, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { HelperUser, Vicinity, Purpose } from '../../types/HelperUser';
import { VIPUser } from '../../types/VIPUser';
import { getFormattedHelperList } from './AssistanceRequest';

let renders = 0;

const socket = io(process.env.REACT_APP_BACKEND_ENDPOINT!);

const fakeHelpers = [
	new HelperUser('Lee', Vicinity.Regularly, Purpose.Working, true),
	new HelperUser('Laura', Vicinity.Sometimes, Purpose.Working, true),
	new HelperUser('Jose', Vicinity.FirstTime, Purpose.Working, true),
	new HelperUser('Abdul', Vicinity.Regularly, Purpose.Visiting, true),
	new HelperUser('Eric', Vicinity.Sometimes, Purpose.Visiting, true),
	new HelperUser('Fatima', Vicinity.FirstTime, Purpose.Visiting, true)
];

export function VIPDashboard() {
	const location = useLocation();
	const navigate = useNavigate();

	const [checked, setChecked] = useState<number[]>([]);
	const { vip } = location.state as { vip: VIPUser };

	const [loading, setLoadingStatus] = useState(true);
	const [helpers, setHelperList] = useState<HelperUser[]>(fakeHelpers);

	const [displayConfirmModal, setDisplayConfirmModal] = useState(false);

	// Only request helper list on first load
	if (renders === 0) requestHelperList();

	renders++;

	const handleToggle = (value: number) => () => {
		const currentIndex = checked.indexOf(value);
		const newChecked = [...checked];

		if (currentIndex === -1) {
			newChecked.push(value);
		} else {
			newChecked.splice(currentIndex, 1);
		}

		setChecked(newChecked);
	};

	function requestHelperList() {
		setLoadingStatus(true);
		socket.emit('request-helper-list');
	}

	useEffect(() => {
		socket.on('helper-list', (stringifiedHelperListObj) => {
			const helperList = JSON.parse(stringifiedHelperListObj);

			setHelperList(combineWithFakeHelpers(helperList));

			console.log(helperList);

			setLoadingStatus(false);
		});

		socket.on('helper-list-updated', (stringifiedHelperListObj) => {
			const helperList = JSON.parse(stringifiedHelperListObj);

			setHelperList(combineWithFakeHelpers(helperList));
		});
	});

	return (
		<div id='vipDashboard'>
			{loading ? (
				<div id='helperListLoadWrapper'>
					<p>Getting available helpers...</p>
					<CircularProgress />
				</div>
			) : (
				<>
					{helpers.length > 0 ? (
						<div className='dash'>
							<div>
								<p>Below is a list of nearby helpers, please select one or more people you would like to request help from:</p>
							</div>
							<div className='list'>
								<List dense sx={{ bgcolor: 'background.paper' }}>
									{helpers.map((value, idx) => {
										const labelId = `checkbox-list-secondary-label-${value}`;
										const isBoxChecked = checked.indexOf(helpers.indexOf(value)) !== -1;

										return (
											<ListItem key={idx} disablePadding>
												<ListItemButton onPointerDown={handleToggle(helpers.indexOf(value))} aria-label={isBoxChecked ? 'checked' : 'unchecked'} dense>
													<ListItemIcon>
														<Checkbox edge='start' checked={isBoxChecked} tabIndex={-1} disableRipple inputProps={{ 'aria-labelledby': labelId }} />
													</ListItemIcon>
													<ListItemText id={labelId} primary={`${value.name}, ${formatPhrase(Purpose[value.purpose])} Here ${formatPhrase(Vicinity[value.vicinity])}`} />
												</ListItemButton>
											</ListItem>
										);
									})}
								</List>
							</div>
							{checked.length === 0 ? (
								<></>
							) : (
								<div className='large-next-button' onPointerDown={() => setDisplayConfirmModal(true)}>
									<h2>Next</h2>
								</div>
							)}
						</div>
					) : (
						<div id='noAvailableHelpersWrapper'>
							<p>There are currently no available helpers.</p>
							<br />
							<p>Helpers will appear on this page once they become available.</p>
						</div>
					)}
					<div id='confirmModalWrapper' className={displayConfirmModal ? '' : 'hidden'} aria-hidden={displayConfirmModal ? 'false' : 'true'}>
						<div id='confirmModal'>
							<h3>Confirm Helper Selection</h3>
							<p>{`You have currently selected ${getFormattedHelperList(checked.map((value) => helpers[value]))}.`}</p>
							<div>
								<Button
									variant='contained'
									onPointerDown={() => {
										const selectedHelpers = checked.map((value) => helpers[value]);

										//Navigate to next page
										navigate('/vip/assistance-request', { state: { vip: vip, helpers: selectedHelpers, allPossibleHelpers: helpers } });
									}}
								>
									Confirm Helper Selection
								</Button>
								<Button variant='contained' onPointerDown={() => setDisplayConfirmModal(false)}>
									Go Back
								</Button>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
}

function formatPhrase(word: string) {
	switch (word) {
		case 'Working':
			return 'Works';
		case 'Visiting':
			return 'Visits';
		case 'FirstTime':
			return '(First Time)';
		default:
			return word;
	}
}

function combineWithFakeHelpers(helpers: HelperUser[]): HelperUser[] {
	const allHelpers = [...fakeHelpers].concat([...helpers]);

	return shuffleArray(allHelpers);
}

function shuffleArray(array: HelperUser[]): HelperUser[] {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}

	return array;
}
