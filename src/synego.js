// SynegoBlade: A simple data binding and offline-first library.

class Synego {
    constructor(options) {
        this._bindings = new Map();
        this.data = this._createProxy(options.data || {});
        this._scan();
    }

    _createProxy(data, path = '') {
        const self = this;

        // Recursively make nested objects reactive
        for (const key in data) {
            if (typeof data[key] === 'object' && data[key] !== null) {
                data[key] = self._createProxy(data[key], (path ? path + '.' : '') + key);
            }
        }

        return new Proxy(data, {
            set(target, property, value) {
                // If the new value is an object, it needs to be proxied before being set.
                if (typeof value === 'object' && value !== null) {
                    target[property] = self._createProxy(value, (path ? path + '.' : '') + property);
                } else {
                    target[property] = value;
                }

                const fullPath = (path ? path + '.' : '') + property;
                self._updateBindings(fullPath, value);
                return true;
            }
        });
    }

    _scan() {
        const elements = document.querySelectorAll('[model]');
        elements.forEach(el => {
            const key = el.getAttribute('model');
            
            // Register the binding
            const bindings = this._bindings.get(key) || [];
            this._bindings.set(key, bindings.concat(el));

            // Initial UI update from data
            this._updateElement(el, this._getValue(key));

            // Listen for UI changes to update data (2-way binding)
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) {
                el.addEventListener('input', (event) => {
                    this._setValue(key, event.target.value);
                });
            }
        });
    }

    _setValue(key, value) {
        const keys = key.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((acc, part) => acc && acc[part], this.data);
        if (target && typeof target === 'object') {
            target[lastKey] = value; // This will trigger the proxy's set trap
        }
    }

    _updateBindings(property, value) {
        if (this._bindings.has(property)) {
            this._bindings.get(property).forEach(el => {
                this._updateElement(el, value);
            });
        }
    }

    _updateElement(el, value) {
        const displayValue = value === null || value === undefined ? '' : value;
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) {
            if (el.value !== displayValue) {
                el.value = displayValue;
            }
        } else {
            if (el.textContent !== displayValue) {
                el.textContent = displayValue;
            }
        }
    }

    _getValue(key) {
        return key.split('.').reduce((acc, part) => acc && acc[part], this.data);
    }

    get(key) {
        const elements = document.querySelectorAll(`[model="${key}"]`);
        const values = [];
        elements.forEach(el => {
            values.push(el.value);
        });
        return values.length > 1 ? values : values[0];
    }

    updateAll(data) {
        for (const key in data) {
            if (this.data.hasOwnProperty(key)) {
                if (typeof data[key] === 'object' && data[key] !== null) {
                    for (const nestedKey in data[key]) {
                        if (this.data[key].hasOwnProperty(nestedKey)) {
                            this.data[key][nestedKey] = data[key][nestedKey];
                        }
                    }
                } else {
                    this.data[key] = data[key];
                }
            }
        }
    }
}

window.Synego = Synego;
