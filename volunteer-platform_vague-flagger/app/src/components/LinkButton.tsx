import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

// Link functionality (not tested): https://stackoverflow.com/questions/42463263/wrapping-a-react-router-link-in-an-html-button

export const LinkButton = ({ textContent, targetPath, style = 1 }: { textContent: string; targetPath: string; style?: number }) => {
	return (
		<div className='link-button-wrapper'>
			<Link style={{ textDecoration: 'none' }} to={targetPath}>
				<Button variant={style === 1 ? 'contained' : 'outlined'} sx={{ bgcolor: 'primary.main' }}>
					{textContent}
				</Button>
			</Link>
		</div>
	);
};
