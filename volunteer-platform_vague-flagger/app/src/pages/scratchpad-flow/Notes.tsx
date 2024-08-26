import { useLocation } from 'react-router-dom';
import { ScratchpadHeader } from '../../components/ScratchpadHeader';

export function Notes() {
	const location = useLocation();

	const { text } = location.state as { text: { text: string } };

	return (
		<div id='notes'>
			<ScratchpadHeader title='Notes' backButton={false} />
			<div id='finalizedNotesWrapper'>{text.text}</div>
		</div>
	);
}
