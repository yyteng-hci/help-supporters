import { Select, MenuItem, FormControl } from '@mui/material';

// onChange should be a callback function with props of (event: SelectChangeEvent).
export const SelectDropdown = ({
	label,
	options,
	onChange,
	selectedOption,
	centerDropdown = false
}: {
	label: string;
	options: { value: number; name: string }[];
	onChange: any;
	selectedOption: number;
	centerDropdown?: boolean;
}) => {
	return (
		<FormControl>
			<Select
				value={selectedOption}
				aria-label={label}
				onChange={onChange}
				style={{ minWidth: '120px' }}
				MenuProps={{
					anchorOrigin: {
						vertical: 'bottom',
						horizontal: centerDropdown ? 'center' : 'left'
					}
				}}
			>
				{[(<MenuItem value={-1} disabled key={-1}></MenuItem>) as JSX.Element].concat(
					options.map(({ value, name }, idx) => (
						<MenuItem value={value} key={idx}>
							{name}
						</MenuItem>
					))
				)}
			</Select>
		</FormControl>
	);
};
