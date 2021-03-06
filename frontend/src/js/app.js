import $ from "cash-dom";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import VueTippy from 'vue-tippy';
import tooltipOptions from './tooltips';

// import Multiselect from '@vueform/multiselect'

// Init
const locale = $('html').attr('lang');
const baseUrl = $('base').attr('href');

async function init() {
	const localeUrl = new URL(`dayjs/locale/${locale}.js`, baseUrl).toString()

	dayjs.locale(locale);
	dayjs.extend(localizedFormat);
	try {
		dayjs.extend(await import(localeUrl));
	} catch (error) {
		console.error('Locale loading failed!', error);
	}
}

/**
 * Makes an API call to the backend.
 *
 * @param {string} action The API action to call.
 * @param {object} data The request body. Optional.
 * @returns {Promise<object>}
 */
async function apiCall(action, data = null) {
	const url = new URL(`api/${action}`, baseUrl);
	const response = await fetch(url.toString(), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: data ? JSON.stringify(data) : undefined
	});
	return response.json();
}

function fadeOut(selector, speed) {
	return new Promise((resolve, _reject) => {
		const fadeTarget = $(selector);
		const get = () => parseFloat(fadeTarget.css('opacity'));
		const set = value => fadeTarget.css('opacity', value);

		const fadeEffect = setInterval(() => {
			if (get() === undefined) {
				set(1);
			}
			if (get() > 0) {
				set(get() - .1);
			} else {
				clearInterval(fadeEffect);
				fadeTarget.remove();
				resolve();
			}
		}, speed);
	});
}

function initialData() {
	return {
		loading: false,
		repos: [],
		properties: {},
		pagination: {},
		total: 0,
		form: {
			perPage: 10,
			filter: {
				language: null
			},
			sort: {}
		}
	};
}

const app = {
	name: 'Starred Repositories',

	data: () => initialData(),
	computed: {
		hasData() {
			return !! this.repos && this.repos.length > 0;
		}
	},
	watch: {
		form: {
			handler: newValue => {
				localStorage.setItem('form', JSON.stringify(newValue));
			},
			deep: true
		}
	},

	methods: {
		async loadProperties() {
			this.properties.licenses = await apiCall('property/license');
			this.properties.languages = await apiCall('property/language');
		},
		async loadRepos(page = 1) {
			const result = await apiCall('starred', {
				page,
				...this.form
			});
			this.pagination = result.pagination || {};
			this.repos = result.data || [];
			this.total = result.total || 0;
		},
		loadAll() {
			return Promise.all([
				this.loadProperties(),
				this.loadRepos()
			]);
		},
		async reset() {
			this.form = initialData().form;
			await this.loadAll();
		},

		goToPage() {
			const page = parseInt( prompt('Enter a page number:') );
			if (! page || page < 1 || page > this.pagination.maxPage) {
				return alert(`Enter a valid number between 1 and ${this.pagination.maxPage}!`);
			}
			this.loadRepos(page);
		},
		getLicense(repo) {
			if (! repo.license) {
				return 'None';
			}
			else if (! repo.license.url) {
				return repo.license.name;
			}
			else {
				return `<a href="${repo.license.url}">${repo.license.name}</a>`;
			}
		},
		formatStarredAt(dateString) {
			return dayjs(dateString).format('L');
		}
	},

	async mounted() {
		await init();

		// load form settings
		try {
			const formSettings = localStorage.getItem('form');
			if (!! formSettings) {
				this.form = JSON.parse(formSettings);
			}
		} catch (error) {
			console.error('Form settings parsing failed!', error);
		}

		await this.loadAll();
		fadeOut('.loading-overlay', 10);
	}
};

// @ts-ignore
Vue.createApp(app)
	.use(VueTippy, {
		defaultProps: tooltipOptions
	})
	// .component('multiselect', Multiselect)
	.mount('#app');
