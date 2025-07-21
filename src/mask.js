(() => {
	let maskCount = 0;
	const ScreenMask = {};
	ScreenMask.show = async () => {
		const mask = document.querySelector('.screenMask');
		if (!mask) return;
		maskCount ++;
		mask.classList.add('active');
		await wait();
		mask.classList.add('show');
	};
	ScreenMask.hide = async () => {
		maskCount --;
		if (maskCount > 0) return;
		if (maskCount < 0) maskCount = 0;

		const mask = document.querySelector('.screenMask');
		if (!mask) return;

		mask.classList.remove('show');
		await wait(250);
		mask.classList.remove('active');
	};

	globalThis.ScreenMask = ScreenMask;
}) ();