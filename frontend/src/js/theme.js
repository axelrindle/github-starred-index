function checkMediaIsDark() {
	return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function setTheme(theme) {
	localStorage.setItem('color-scheme', theme);
	document.getElementById('color-scheme')?.remove();
	document.head.insertAdjacentHTML(
		'beforeend',
		`<style id="color-scheme">:root { color-scheme:${theme} !important; }</style>`
	);
	
}

const toggleElement = /** @type {HTMLInputElement} */ (document.getElementById(
	'tglScheme'
));

toggleElement.checked = checkMediaIsDark();
toggleElement.addEventListener('click', () => setTheme(toggleElement.checked ? 'dark' : 'light'));

// Load preference from storage
const preference = localStorage.getItem('color-scheme');
if (typeof preference === 'string' && [ 'light', 'dark' ].includes(preference)) {
	toggleElement.checked = preference === 'dark';
	setTheme(preference);
}

window
	.matchMedia('(prefers-color-scheme: light)')
	.addEventListener('change', () => {
		localStorage.removeItem('scheme');
		location.reload();
	});
