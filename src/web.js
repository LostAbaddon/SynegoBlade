globalThis.newEle = (tag, ...classList) => {
	var ele = document.createElement(tag);
	classList.forEach(cls => ele.classList.add(cls));
	return ele;
};

Storage.prototype.rawSetItem = Storage.prototype.setItem;
Storage.prototype.rawGetItem = Storage.prototype.getItem;
Storage.prototype.setItem = function (key, value) {
	return this.rawSetItem(key, JSON.stringify(value));
};
Storage.prototype.getItem = function (key, defVal) {
	let val = this.rawGetItem(key);
	if (val === undefined || val === null) return defVal;
	try {
		val = JSON.parse(val);
	}
	catch {
		return defVal;
	}
	return val;
};