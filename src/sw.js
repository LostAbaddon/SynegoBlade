// SynegoBlade Service Worker - SWR with Update Notification

const CACHE_NAME = 'synego-cache-v1';
const APP_SHELL_URLS = [
	'/',
	'/index.html',
	'/synego/sw.js'
	// Other core assets can be pre-cached here if necessary
];

let cacheExclusionPrefixes = [];

// Listen for messages from clients (main app)
self.addEventListener('message', event => {
	if (event.data && event.data.type === 'SET_CACHE_EXCLUSIONS') {
		cacheExclusionPrefixes = event.data.prefixes || [];
		console.log('SW cache exclusion prefixes have been updated:', cacheExclusionPrefixes);
	}
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
});


// 1. Install: Cache the core App Shell and prepare to take control
self.addEventListener('install', event => {
	console.log('SW Installed');
	event.waitUntil(
		caches.open(CACHE_NAME)
		.then(cache => {
			console.log('Opened cache and caching app shell');
			return cache.addAll(APP_SHELL_URLS);
		})
		.then(() => {
			// Force the waiting service worker to become the active service worker.
			return self.skipWaiting();
		})
	);
});

// 2. Activate: Clean up old caches and take control
self.addEventListener('activate', event => {
	console.log('SW Activated');
	event.waitUntil(
		caches.keys().then(cacheNames => {
			return Promise.all(
				cacheNames.map(cacheName => {
					if (cacheName !== CACHE_NAME) {
						console.log('Deleting old cache:', cacheName);
						return caches.delete(cacheName);
					}
				})
			);
		})
		.then(() => {
			// Take control of all clients immediately
			return self.clients.claim();
		})
	);
});

// 3. Fetch: Implement Stale-While-Revalidate with update notification
self.addEventListener('fetch', event => {
	const request = event.request;

	// We only want to apply SWR to GET requests for http/https protocols
	if (request.method !== 'GET' || !request.url.startsWith('http')) {
		return;
	}

	const url = new URL(request.url);

	// Check if the URL should be excluded from cache
	const isExcluded = cacheExclusionPrefixes.some(prefix => url.pathname.startsWith(prefix));
	if (isExcluded) {
		console.log('SW Fetch (network only for excluded path):', request.url);
		event.respondWith(fetch(request)); // Go directly to the network
		return;
	}

	// For all other assets, use Stale-While-Revalidate.
	event.respondWith(
		caches.open(CACHE_NAME).then(cache => {
			return cache.match(request).then(cachedResponse => {
				const fetchPromise = (notifyWhileUpdate) => {
					return fetch(request).then(networkResponse => {
						// If the fetch is successful, update the cache and notify clients
						if (networkResponse.ok) {
							const responseToCache = networkResponse.clone();
							cache.put(request, responseToCache).then(() => {
								// Compare responses before notifying
								if (cachedResponse && !responsesAreSame(cachedResponse, networkResponse)) {
									if (!!notifyWhileUpdate) {
										console.log('Update resource:', request.url);
										self.clients.matchAll().then(clients => {
											clients.forEach(client => client.postMessage({ type: 'UPDATE_AVAILABLE', url: request.url }));
										});
									}
								}
							});
						}
						return networkResponse;
					});
				};

				// Return cached response immediately, while the fetch happens in the background
				if (!cachedResponse) {
					return fetchPromise(false);
				}
				else {
					setTimeout(() => {
						fetchPromise(true);
					}, 0);
					return cachedResponse;
				}
			});
		})
	);
});

// Helper function to compare two Response objects.
function responsesAreSame(res1, res2) {
	// 1. If either response is missing, they are not the same.
	if (!res1 || !res2) {
		return false;
	}

	// 2. Use ETag for strong validation if available on both.
	// ETag is an identifier for a specific version of a resource.
	const etag1 = res1.headers.get('etag');
	const etag2 = res2.headers.get('etag');
	if (etag1 && etag2) {
		// Note: W/ prefix indicates a "weak" ETag, but for our purpose of detecting
		// a change, comparing them directly is usually sufficient.
		return etag1 === etag2;
	}

	// 3. Use Last-Modified as a fallback if ETag is not available.
	// This is less reliable than ETag but better than content-length.
	const lastModified1 = res1.headers.get('last-modified');
	const lastModified2 = res2.headers.get('last-modified');
	if (lastModified1 && lastModified2) {
		return lastModified1 === lastModified2;
	}

	// 4. As a last resort, compare content-length.
	// This is the least reliable method but can catch basic changes.
	const size1 = res1.headers.get('content-length');
	const size2 = res2.headers.get('content-length');
	if (size1 && size2) {
		return size1 === size2;
	}

	// 5. If no headers can be used for comparison, assume they are different
	// to be on the safe side, triggering a potential update.
	return false;
}