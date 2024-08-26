import { IconButton } from '@mui/material';
import { Divider } from './Divider';
import { ArrowBackIosNew } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const Header = ({ title, subtext }: { title: string; subtext: string }) => {
	const navigate = useNavigate();

	return (
		<div className='header'>
			<div>
				<IconButton onPointerDown={() => navigate(-1)} size='large'>
					<ArrowBackIosNew />
				</IconButton>
				<h3 tabIndex={0}>{subtext}</h3>
				<h1 tabIndex={0}>{title}</h1>
			</div>
			<Divider />
		</div>
	);
};
