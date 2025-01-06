class CustomSelectInput extends HTMLElement {
    constructor() {
        super();
        this.#shadow = this.attachShadow({ mode: 'closed' });
        this.state = {
            value: '',
            options: [],
            placeholder: '',
            selectionMode: 'single'
        };
        this.textbox = this.#textbox;
        this.dropdown = this.#dropdown;
        this.announcementRegion = null;
    }

    #textbox = (() => { return this.textbox; })();
    #dropdown = (() => { return this.dropdown; })();

    static get observedAttributes() {
        return ['data-placeholder', 'data-options', 'data-value', 'data-selection-mode'];
    }
#shadow;

    connectedCallback() {

        this.#render();
        this.#initializeState();
        this.#initializeAttributes();
        this.#setupEventListeners();
    }

    disconnectedCallback() {
        this.#cleanupEventListeners();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue || (!oldValue || !newValue || !name) || (name != 'data-options' || name != 'data-placeholder' || name != "data-value" || name != 'data-selection-mode')) return;
        const handlers = {
            'data-value': () => this.#updateValue(newValue),
            'data-options': () => {
                this.state.options = this.#parseOptions(newValue);
                this.#syncOptionsWithSelect();
            },
            'data-placeholder': () => this.#updatePlaceholder(newValue),
            'data-selection-mode': () => this.#updateSelectionMode(newValue)
        };
        handlers[name]?.();
    }

    #initializeState() {
        this.#textbox = this.#shadow.querySelector('input');
        this.#dropdown = this.#shadow.querySelector('select');
        this.announcementRegion = document.querySelector('#announcement');
    }

    #initializeAttributes() {
        this.state.placeholder = this.getAttribute('data-placeholder') || 'Type/Select an option';
        this.state.options = this.#parseOptions(this.getAttribute('data-options'));
        this.state.value = this.getAttribute('data-value') || '';
        this.state.selectionMode = this.getAttribute('data-selection-mode') || 'single';
        this.#updateUI();
    }

    #setupEventListeners() {
        this.#textbox?.addEventListener('input', this.#handleTextInput.bind(this));
        this.#textbox?.addEventListener('keydown', this.#handleKeyPress.bind(this));
        this.#dropdown?.addEventListener('keydown', this.#handleTextInput.bind(this));
        this.#dropdown?.addEventListener('change', this.#handleSelectChange.bind(this));
        this.#dropdown?.addEventListener('focus', this.#handleFocus.apply(this));
    }

    #cleanupEventListeners() {
        this.#textbox?.removeEventListener('input', this.#handleTextInput);
        this.#textbox?.removeEventListener('keydown', this.#handleKeyPress);
        this.#dropdown?.removeEventListener('change', this.#handleSelectChange);
    }

    #render() {
        const template = `

<style>
:host {
    display: inline-block;
    width: 200px;
    height: 1.5rem;
    contain: strict;
    position: initial;
    color: red;
    border: 2px groove #000;
    background-color: #fff
}
* {
    background-color: #282c34;
    color: #fff;
    font-family: 'Arial', sans-serif;
    font-size: 14px;
    line-height: 1.25rem;
    margin: 0;
    padding: 0;
    width: 100%;
    box-sizing: border-box;
    min-height: 1.5rem;
}
input, select {
    border: 1px solid #555;
    border-radius: 4px;
    padding: 0.25rem;
    position: absolute;
    left: 0;
    top: 0;
    float: left;
    position: relative;
    clear: none;
    z-index: 1;
}
select {
    width: fit-coontent;
    height: 2rem;
    max-height: 0px;
    overflow: hidden;
    z-index: 0;
}
input {
    width: 90%;
    z-index: 9999999999;
    position: absolute;
    float: left;
    clear: none;
    bottom: 0;
    right: 10%;
}
option {
    
}

div, div * {
    height: 100%;
} 

div {
    padding: 0px;
    min-height: 100%;
}
    div:nth-child(2) > select:nth-child(1) {
    top: 0;
    bottom:0;
border: initial;
outline: initial;
box-shadow: initial;
}
:host * {
background-color: inherit;
color: inherit;
font-family: inherit;
font-size: inherit;
line-height: inherit;
margin: 0;
border: none;
border-radius: 0;
}
select {
color: transparent;
background-color: transparent;
}
option {
border: 1px solid black;
border-radius: 50%;
}




</style>
<div>
<select style="top: 0px;"><option value=""></option><option value="fuck">fuck</option><option value="fuckit">fuckit</option><option value="it">]</option></select>
<input type="text" placeholder="Type/Select an option" style="width: 90%;z-index: 9999999999;position: absolute;float: left;clear: none;bottom: 0;right: 10%;">

</div>
`;
        this.#shadow.innerHTML = template;
        this.style.padding = '0px';

        this.#initializeState();
    }

    #updateUI() {
        this.#updatePlaceholder(this.state.placeholder);
        this.#updateValue(this.state.value || this.state.options[0]?.value || '');
        this.#syncOptionsWithSelect();
        this.#positionDropdown();
    }

    #updateSelectionMode(mode) {
        this.state.selectionMode = ['single', 'multiple'].includes(mode) ? mode : 'single';
        this.#dropdown.multiple = this.state.selectionMode === 'multiple';
        this.#syncOptionsWithSelect();
    }

    #parseOptions(optionsData) {
        if (!optionsData || !(typeof optionsData == 'string' && optionsData?.length > 0)) return this.#getDefaultOptions();
        try {
            return optionsData
                .trim()
                .replace(/^[\[\]]/g, '')
                .split(',')
                .map(opt => {
                    const [value, text] = opt.includes(':')
                        ? opt.split(':').map(part => part.trim().replace(/'/g, ''))
                        : [opt.trim(), opt.trim()];
                    return { value, text };
                });
        } catch {
            return this.#getDefaultOptions();
        }
    }

    #getDefaultOptions() {
        if ((this.getAttribute('data-options') == null || this.getAttribute('data-options') == '' || this.getAttribute('data-options') == '[]' || this.getAttribute('data-options') == '""') || !this.getAttribute('data-options')) {
            this.setAttribute('data-options', '[ : ]');
            return [
                { value: '', text: '' },
                { value: 'Option1', text: 'Option 1' },
                { value: 'Option2', text: 'Option 2' },
                { value: 'Option3', text: 'Option 3' }
            ];
        }
        else {
            return this.#parseOptions(this.getAttribute('data-options'));
        };

    }

    #syncOptionsWithSelect() {
        if (!this.#dropdown) return;
        this.#dropdown.innerHTML = (this.state.options
            .map(option => `<option value="${option.value}">${option.text}</option>`)
            .join('').replace(']', '').replace('[', ''));
        this.#dropdown.value = this.state.value;

    }

    #handleTextInput(event = { target: this.#textbox }) {
        this.state.value = event.target.value;
        this.#announce(`Input updated to: ${this.state.value}`);
        this.dispatchEvent(new CustomEvent('input-changed', {
            detail: { value: this.state.value },
            bubbles: true,
            composed: true,
            view: null
        }));
    }

    #handleKeyPress(event = { key: 'Enter', target: this.#textbox }) {
        if (event.key === 'Enter' && this.#textbox.value.trim()) {
            const value = this.#textbox.value;
            if (!this.state.options.some(opt => opt.value === value)) {
                this.state.options.push({ value, text: value });
                this.#syncOptionsWithSelect();
            }
            this.#updateValue(value);
            this.#announce(`Option added: ${value}`);
            this.dispatchEvent(new CustomEvent('input-added', {
                detail: { value: value },
                bubbles: true,
                composed: true,
                view: null
            }));
        }
    }

    #handleSelectChange(event = { target: this.#dropdown }) {
        if (event.target === this.#dropdown) {
            this.state.value = event.target.value;
            this.#updateValue(this.state.value);
            this.#announce(`Selected option: ${this.state.value}`);
            this.dispatchEvent(new CustomEvent('selection-changed', {
                detail: { value: this.state.value },
                bubbles: true,
                composed: true,
                view: null
            }));
        }
    }


    #handleFocus(e = { target: this.#textbox }) {
        const t = e.target;
        const t2 = e.target == this.#textbox ? this.#dropdown : this.#textbox;
        if (t == this.#dropdown) {
            t2.focus();
        }
        t.style.border = 'initial';
        t.style.outline = 'initial';
        t.style.boxShadow = 'initial';
        t2.style.border = 'initial';
        t2.style.outline = 'initial';
        t2.style.boxShadow = 'initial';
    }

    #updateValue(value) {
        if (this.state.selectionMode === 'multiple') {
            if (Array.isArray(value)) {
                this.state.value = value.join(',');
            } else if (typeof value === 'string') {
                this.state.value = value.split(',')
                    .map(v => v.trim())
                    .filter(v => v !== '')
                    .join(',');
            }
        } else {
            this.state.value = Array.isArray(value) ? value[0] : value;
        }

        this.setAttribute('data-value', this.state.value);
        this.setAttribute('data-options', JSON.stringify(this.state.options));

        if (this.#textbox) {
            this.#textbox.value = this.state.value;
        }

        if (this.#dropdown) {
            if (this.state.selectionMode === 'multiple') {
                const values = this.state.value.split(',');
                Array.from(this.#dropdown.options).forEach(option => {
                    option.selected = values.includes(option.value);
                });
            } else {
                this.#dropdown.value = this.state.value;
            }
        }

        if (!this.state.options.some(opt => opt.value === this.state.value)) {
            this.state.options.push({ value: this.state.value, text: this.state.value });
            this.#syncOptionsWithSelect();
        }
    }
    #updatePlaceholder(placeholder) {
        if (this.#textbox) this.#textbox.placeholder = placeholder;
    }

    announcementRegion = () => {
        const ar = document.createElement('p');

        ar.style = {
            position: 'absolute',
            overflow: 'hidden',
            zIndex: '9999',
            backgroundColor: '#f0f0f0dd'
        }
        document.body.appendChild(ar);
        return ar;
    }

    #announce(message) {
        if (this.announcementRegion) {
            this.announcementRegion.textContent = message;
        }
    }

    #positionDropdown() {
        if (!this.#textbox || !this.#dropdown) return;
        const textboxRect = this.#textbox.getBoundingClientRect();
        const dropdownRect = this.#dropdown.getBoundingClientRect();
        const dropdownHeight = dropdownRect.height;
        const textboxHeight = textboxRect.height;
        const dropdownTop = textboxRect.bottom;
        const dropdownLeft = textboxRect.left;
        this.style.top = `${textboxRect.top}px`;
        this.style.left = `${dropdownLeft * textboxRect.left / 2}px`;
        if (this.style.height != this.#dropdown.style.height) {
            this.#textbox.style.height = this.style.height;
        }
        if (this.style.height != this.#dropdown.style.height) {
            this.#dropdown.style.height = this.#textbox.style.height;
        }
        if (this.#textbox.style.fontSize > this.style.height - this.#textbox.style.padding) {
            this.#textbox.style.fontSize = this.style.height - this.#textbox.style.padding;
        }
    }

    #determineBrowser() {
        const userAgent = navigator?.userAgent;
        let codeName = 'Unknown';

        const browserPatterns = [
            { pattern: "Chrome", name: "Google Chrome", excludes: ["Edge", "OPR"] },
            { pattern: "Firefox", name: "Mozilla Firefox" },
            { pattern: "Safari", name: "Safari", excludes: ["Chrome"] },
            { pattern: "Edge", name: "Microsoft Edge" },
            { pattern: ["OPR", "Opera"], name: "Opera" },
            { pattern: ["MSIE", "Trident"], name: "Internet Explorer" }
        ];

        for (const browser of browserPatterns) {
            const patterns = Array.isArray(browser.pattern) ? browser.pattern : [browser.pattern];
            const hasPattern = patterns.some(pattern => userAgent.indexOf(pattern) > -1);
            const noExcludes = !browser.excludes?.some(exclude => userAgent.indexOf(exclude) > -1);

            if (hasPattern && noExcludes) {
                codeName = browser.name;
                break;
            }
        }
        consolee.log(`Browser: ${codeName}    \n fuckinshitt355`);
        return codeName;
    }

    #browserSpecificStyleDefaults(ofName = 'Unknown') {
        const sets = {
            'Google Chrome': (() => {
                return {
                    border: '1px solid #ccc',
                    outline: 'none',
                    borderRadius: '4px',
                    // and so on, such as that the select, input, and containing elements in the custom elements' shadow DOM are rendered the same across browsers.
                };
            })(),
            'Mozilla Firefox': (() => {
                return {
                    border: '1px solid #ccc',
                    outline: 'none',
                    borderRadius: '4px',
                    // and so on, such as that the select, input, and containing elements in the custom elements' shadow DOM are rendered the same across browsers.
                };
            })(),
            'Safari': (() => {
                return {
                    border: '1px solid #ccc',
                    outline: 'none',
                    borderRadius: '4px',
                    // and so on, such as that the select, input, and containing elements in the custom elements' shadow DOM are rendered the same across browsers.
                };
            })(),
            'Microsoft Edge': (() => {
                return {
                    border: '1px solid #ccc',
                    outline: 'none',
                    borderRadius: '4px',
                    // and so on, such as that the select, input, and containing elements in the custom elements' shadow DOM are rendered the same across browsers.
                };
            })(),
            'Opera': (() => {
                return {
                    border: '1px solid #ccc',
                    outline: ''
                }
            })
        };
        const matchingBrowser = Object.keys(sets).find(setName =>
            ofName.includes(setName) || setName.includes(ofName)
        );

        return matchingBrowser ? sets[matchingBrowser] : sets['Google Chrome'];
    }


    #setBrowserSpecificStyles() {
        const thisBrowser = this.#determineBrowser();
        const browserSpecificStyles = this.#browserSpecificStyleDefaults(thisBrowser);

        for (const [property, value] of Object.entries(browserSpecificStyles)) {
            this.style[property] = value;
        }
    }
}

customElements.define('combo-input', CustomSelectInput);
document.body.appendChild(document.createElement('combo-input'));
