//Detects any empty inputs and turns them red onscreen.
export function validateForm(formContainer: HTMLElement): boolean {
	let anyEmptyInputFields = false;
	let anyEmptySelectFields = false;

	// Input Validation
	formContainer.querySelectorAll('input[type="text"]').forEach((input) => {
		if ((input as HTMLInputElement).value.trim() === '' && input.parentElement!.parentElement!.classList.contains('required')) {
			anyEmptyInputFields = true;
			(input as HTMLElement).parentElement!.classList.add('Mui-error');

			// Error: Empty input, implement sound feedback
		} else (input as HTMLElement).parentElement!.classList.remove('Mui-error');
	});

	// Dropdown Validation
	formContainer.querySelectorAll('div.MuiSelect-select').forEach((select) => {
		const parentElement = select.parentElement!;

		const selectedContent = (parentElement.querySelector('em') ?? parentElement.querySelector('div.MuiSelect-select'))?.innerHTML.replace(/\u200B/g, '') ?? '';

		if (parentElement.getAttribute('aria-label') === selectedContent || selectedContent.includes('<span')) {
			parentElement.classList.add('Mui-error');

			anyEmptySelectFields = true;
		} else parentElement.classList.remove('Mui-error');
	});

	return !anyEmptyInputFields && !anyEmptySelectFields;
}
