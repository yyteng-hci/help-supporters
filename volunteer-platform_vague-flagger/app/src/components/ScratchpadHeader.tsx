import { IconButton } from '@mui/material';
import { Divider } from './Divider';
import { ArrowBackIosNew } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const ScratchpadHeader = ({ title, backButton = true }: { title: string; backButton?: boolean }) => {
	const navigate = useNavigate();

	return (
		<div className='scratchpad-header'>
			<div style={{ gridTemplateColumns: `${backButton ? '40px calc(auto - 80px)' : 'auto'}` }}>
				{backButton ? (
					<IconButton onPointerDown={() => navigate(-1)} size='large'>
						<ArrowBackIosNew />
					</IconButton>
				) : (
					''
				)}
				<h2>{title}</h2>
			</div>
			<Divider />
		</div>
	);
};
