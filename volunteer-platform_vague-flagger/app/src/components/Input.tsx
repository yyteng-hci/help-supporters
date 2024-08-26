import { TextField } from '@mui/material';
import { useEffect, useState } from 'react';

export const Input = ({
	label,
	onlyAllowLetters = true,
	required = false,
	multiline = false,
	onEdit
}: {
	label: string;
	onlyAllowLetters?: boolean;
	required?: boolean;
	multiline?: boolean;
	onEdit?: Function;
}) => {
	const [value, setValue] = useState('');

	useEffect(() => {
		if (onEdit !== undefined) onEdit(value);
	});

	return (
		<TextField
			id='outlined-basic'
			className={required ? 'required' : ''}
			label={label}
			variant='outlined'
			required={required}
			multiline={multiline}
			aria-label={label}
			value={value}
			onChange={(e) => {
				if (onlyAllowLetters) {
					const regex = /^([a-z]){0,15}$/i;

					if (e.target.value === '' || regex.test(e.target.value)) setValue(e.target.value);
				} else setValue(e.target.value);
			}}
		/>
	);
};
