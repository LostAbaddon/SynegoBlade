// SynegoBlade PWA Client-side Manager

class SynegoPWA {
	constructor(options = {}) {
		this.swPath = options.swPath || '/synego/sw.js';
		this.cacheExclusionPrefixes = options.cacheExclusionPrefixes || [];
		this.registration = null;
		this.init();
	}

	init() {
		if ('serviceWorker' in navigator) {
			window.addEventListener('load', () => {
				this.registerServiceWorker();
				this.listenForUpdates();
			});
		}
	}

	async registerServiceWorker() {
		try {
			this.registration = await navigator.serviceWorker.register(this.swPath, { scope: '/' });
			console.log('ServiceWorker registration successful with scope: ', this.registration.scope);
			this.startHeartbeat();
			this.sendCacheExclusionPrefixes();
		} catch (err) {
			console.log('ServiceWorker registration failed: ', err);
		}
	}

	sendCacheExclusionPrefixes() {
		const send = () => {
			if (navigator.serviceWorker.controller) {
				navigator.serviceWorker.controller.postMessage({
					type: 'SET_CACHE_EXCLUSIONS',
					prefixes: this.cacheExclusionPrefixes
				});
			}
			else {
				console.warn('Send CacheExclusion to SW failed! SW isn\'t ready now.');
			}
		};

		if (navigator.serviceWorker.controller) {
			send();
		}
		else {
			// This event listener will fire when the service worker has taken control
			navigator.serviceWorker.addEventListener('controllerchange', send);
		}
	}

	startHeartbeat() {
		setInterval(() => {
			const isOnline = navigator.onLine;

			// Update UI status if element exists
			const statusEl = document.getElementById('status');
			if (statusEl) {
				statusEl.textContent = isOnline ? 'Online' : 'Offline';
				statusEl.className = 'status ' + (isOnline ? 'online' : 'offline');
			}
		}, 5000); // Check every 5 seconds
	}

	listenForUpdates() {
		navigator.serviceWorker.addEventListener('message', event => {
			if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
				this.showUpdateToast();
			}
		});
	}

	showUpdateToast() {
		let toast = document.getElementById('update-toast');
		if (!toast) {
			toast = document.createElement('div');
			toast.id = 'update-toast';
			toast.className = 'update-toast';
			toast.innerHTML = `
				<span>A new version is available.</span>
				<button id="refresh-button">Refresh</button>
			`;
			document.body.appendChild(toast);

			document.getElementById('refresh-button').addEventListener('click', () => {
				this.requestSkipWaiting();
				setTimeout(() => {
					location.reload();
				}, 1000);
			});
		}
		toast.classList.add('show');
	}

	requestSkipWaiting() {
		// Send a message to the waiting service worker to activate itself
		if (this.registration && this.registration.waiting) {
			this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
			// The 'controllerchange' event will fire when the new SW becomes active
			navigator.serviceWorker.addEventListener('controllerchange', () => {
				// Reload the page to use the new assets
				window.location.reload();
			});
		}
	}
}