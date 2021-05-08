import tippy, { roundArrow } from 'tippy.js/dist/tippy.cjs';

const opts = {
	animation: 'shift-away',
	arrow: roundArrow,
	content: element => element.getAttribute('data-tippy-content'),
	followCursor: 'horizontal',
	theme: 'gsi'
};
tippy('[data-tippy-content]', opts);

export default opts;
