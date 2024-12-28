const createCustomSelectInput = () => {
    class CustomSelectInput extends HTMLElement {
        constructor() {
            super();
            this.element = {
                select: class extends HTMLSelectElement {},
                textinput: class extends HTMLInputElement { },
                button: class extends HTMLButtonElement { }
            };
            this.attachShadow({ mode: 'open' });
            this.state = {
                value: '',
                options: [],
                placeholder: ''
            };
            this.textbox = null;
            this.dropdown = null;
            this.newOptionButton = null;
            this.showOptionsButton = null;
            this.a = false;


        }



        static get observedAttributes() {
            return ['data-placeholder', 'data-options', 'data-value'];
        }

        connectedCallback() {
            this.render();
            this.initializeState();
            this.initializeAttributes();
            this.addDropButton();
            this.showList = HTMLSelectElement.prototype.showPicker.apply(this.dropdown);
            if (this.showList) {
                this.showlist();
            }
        }

        initializeState() {
            this.textbox = this.shadowRoot.querySelector('input');
            this.dropdown = this.shadowRoot.querySelector('select');
            this.showOptionsButton = this.shadowRoot.querySelector('#newOptionButton');
            if (this.showOptionsButton !== null) {
                this.showOptionsButton.addEventListener('click', this.showOptions.bind(this));
                this.newOptionButton = this.showOptionsButton;
            }
            this.setupEventListeners();
        }

        initializeAttributes() {
            if (!this.getAttribute('data-options')) {
                this.setAttribute('data-options', "[ : , Option1:Option1, 2:'Option 2',Option 3:3]");
            }
            if (!this.getAttribute('data-placeholder')) {
                this.setAttribute('data-placeholder', "Type/Select an option");
            }
            if (!this.getAttribute('data-value')) {
                this.setAttribute('data-value', "");
            }
            this.state.placeholder = this.getAttribute('data-placeholder');
            this.state.options = this.parseOptions(this.getAttribute('data-options'));
            this.state.value = this.getAttribute('data-value') || '';
            this.updateUI();
        }

        updateUI() {
            if (!this.textbox || !this.dropdown) return;
            this.updatePlaceholder(this.state.placeholder);
            this.updateValue(this.state.value || this.state.options[0]?.value || '');
            this.syncOptionsWithSelect();
        }

        addDropButton() {
            if (!this.newOptionButton || !this.a) {

            }
            this.dropdown.style.width = '90%';
            this.boundShowOptions = this.showOptions.bind(this);
        }

        showOptions(_e) {
            this.dropdown.showPicker();
        }

            /**
            * @summary Parses the options data and returns an array of objects representing the options.
            * @param {string} optionsData - The options data to be parsed.
            * Formats can be:
             - Array ['x:y', 'x:', ':y', {'x':'y'}, ...]
             -
             - string-Array "[\'x:y\', \'x:\', \':y\', \{\'x\':\'y\'\}]"
             - string-Array "x:y,x:,:y,{x:y}"
             - string "x, y:z,x y z"
             * @returns - [{value: 'x', text: 'y'}, {value: 'x', text: ''}, {value: '', text: 'y'}, {value='x', text: 'y'}, ...]                                   
             */
            parseOptions(optionsData) {
                if (!this.getAttribute('data-options') && !optionsData) {
                    return this.getDefaultOptions();
                }

                try {
                    let opts = Array.isArray(optionsData)
                        ? optionsData
                        : optionsData.trim().replace(/^\[|\]$/g, '').split(',');
                    return opts.map(opt => {
                        const trimmedOpt = opt.trim();
                        if (trimmedOpt.includes(':')) {
                            const [value, text] = trimmedOpt.split(':');
                            return { value: value.trim().replace(/'/g, ''), text: text.trim() };
                        }
                        return { value: trimmedOpt, text: trimmedOpt };
                    });
                } catch (error) {
                    console.error('Error parsing options:', error);
                }
                if (Array.isArray(optionsData)) {
                    opts = optionsData;
                } else if (typeof optionsData === 'string') {
                    opts = optionsData.trim().replace('[', '').replace(']', '').split(',');
                }

                options = opts.map(opt => {
                    const trimmedOpt = opt.trim();
                    if (trimmedOpt.includes(':')) {
                        const [value, text] = trimmedOpt.split(':');
                        return { value: value.trim().replace(/'/g, ''), text: text.trim() };
                    }
                    return { value: trimmedOpt, text: trimmedOpt };
                });

                return options.length > 0 ? options : this.getDefaultOptions();
            }


        getDefaultOptions() {
            const defaultValue = this.state.placeholder || this.state.value || '';
            return [
                { value: defaultValue, text: defaultValue },
                { value: '1', text: 'Option 1' },
                { value: '2', text: 'Option 2' },
                { value: '3', text: 'Option 3' }
            ];
        }

        syncOptionsWithSelect() {
            if (!this.dropdown) return;
            this.dropdown.innerHTML = '';
            this.state.options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.value;
                optionElement.textContent = option.text;
                this.dropdown.appendChild(optionElement);
            });
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue === newValue) return;
            const handlers = {
                'data-value': () => this.updateValue(newValue),
                'data-options': () => {
                    this.state.options = this.parseOptions(newValue);
                    this.syncOptionsWithSelect();
                },
                'data-placeholder': () => this.updatePlaceholder(newValue)
            };
            handlers[name]?.();
        }

        render() {
            this.shadowRoot.innerHTML = `
            <style> select { border: none; padding: 0px; width: 90%; } 
            host: {
	display: contents;
	contain: strict;
	padding: 0px;
	position: inherit;
	inset: 0px;
}</style>
<label for="inpttxt" style="max-width: 200px; contain: layout; z-index: 0; position: relative; display: inline-flex; height: auto; width: 197px; min-inline-size: fit-content;">
    <select id="Level1" style="min-width: fit-content;width: 90%;height: min-content;position: absolute;float:left;clear:none;display:block; top:0;"></select>
    <span style="z-index: 2;height: max-content;width: 100%;contain: style;position: relative; float: left; clear: none;min-width: 100%;" id="lvl1o3">
        <input type="text" id="i1" value="default" name="inpttxt" placeholder="Type/Select an option" style="z-index: 3; position: absolute; inset: 0px;">
    <button id="newOptionButton" title="Click To Show List Press Enter To Add" style="z-index: 2147483647;float: right;display: block;position: relative;margin: 0px;" onclick="">|↴</button></span>
</label>`;
            this.style.display = 'contents';


        }

        setupEventListeners() {
            const boundText = this.handleTextInput.bind(this.textbox);
            this.boundText = boundText;
            const boundKeyPress = this.handleKeyPress.bind(this.textbox);
            this.boundKeyPress = boundKeyPress;
            const boundSelectChange = this.handleSelectChange.bind(this.dropdown);
            if (!this.textbox || !this.dropdown) return;
            this.textbox.addEventListener('input', boundText);
            this.textbox.addEventListener('keydown', boundKeyPress);
            this.dropdown.addEventListener('change', this.handleSelectChange);
            this.boundFocus = this.handleFocus.bind(this);
            this.dropdown.addEventListener('focus', this.boundFocus);
        }

        #forceFocusonInput() {
            this.textbox.focus();
        }
            handleFocus(e) {
                if (e.target !== this.textbox) {
                    this.#forceFocusonInput()
                }
            }

            

        showNewOptionButton() {
            const newOptionButton = document.createElement('button');
            newOptionButton.textContent = '|' + '\u21B4';
            newOptionButton.id = 'newOptionButton';
            this.newOptionButton = newOptionButton;
            const hoverStyle = document.createElement('style');
            hoverStyle.textContent = `
            #newOptionButton {
                position: absolute;
                top: 0;
                right: 0;
                width: fit-content;
                margin: 0;
                z-index: 20;
                border: none;
                background-color: transparent;
                color:rgba(0, 0, 0, 0.65);
                cursor: pointer;
                transition: all 0.2s ease-in-out;
                transform: scale(1);
                padding: 0px 3%;
            }
            #newOptionButton:hover {
                color:rgb(0, 0, 0);
                background-color: rgba(234, 234, 234, 0.53);
                border: 1px ridge #00000022;
            }
            `;
            this.styles += hoverStyle.textContent;
            this.stamp = this.shadowRoot.querySelector('label') || this.dropdown.parentElement;
            this.stamp.style.cssText += `\n${hoverStyle.textContent}`;
            newOptionButton.title = 'Click To Show List\nPress Enter To Add';

            const parentStyles = {
                width: '100%',
                contain: 'paint',
                display: 'inline-flex',
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                minWidth: 'fit-content'
            };

            Object.assign(this.textbox.parentElement.style, parentStyles);
            Object.assign(this.textbox.style, { width: '100%' });
            Object.assign(this.dropdown.style, {
                width: '100%',
                height: '1rem'
            });

            this.textbox.parentElement.appendChild(newOptionButton);
            this.shadowRoot.querySelector('#newOptionButton').style.zIndex = '9999';
            this.textbox.style.zIndex = '9998';
            this.dropdown.style.zIndex = '9997';
            this.boundnewoptclick = this.#newOptionButton_click.bind(this);
            newOptionButton.addEventListener('click', this.boundnewoptclick);
            this.dropdown.addEventListener('focus', () => { this.textbox.focus(); });
            this.style.cssText += `\n*{max-height: 100%;overflow: hidden;}`;
            this.textbox.style.height = '100%';
            this.textbox.parentElement.style.maxHeight = '100%';
            this.stamp.style.maxHeight = '5vh';



        }

        textboxkeydownevent() {
            this.textbox.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Enter',
                target: { value: 'New Option' },
                preventDefault: () => { }
            }));
            console.log(this.textbox, 'textboxkeydownevent');
        }

        #newOptionButton_click() {
            this.dropdown.showPicker();
            this.isopen = true;
        }

        handleTextInput = (event) => {
            const value = event.target.value;

        };

        handleKeyPress = (event) => {
            if (event.key === 'Enter' && this.textbox.value.trim()) {
                const value = this.textbox.value;
                if (!this.state.options.some(opt => opt.value === value)) {
                    this.state.options.push({ value, text: value });
                    this.syncOptionsWithSelect();
                }
                this.updateValue(value);
                this.dispatchCustomEvent();
            }
        };

        handleSelectChange = (event) => {
            this.updateValue(event.target.value);
            this.dispatchCustomEvent();
        };

        dispatchCustomEvent() {
            this.dispatchEvent(new CustomEvent('change', {
                detail: { value: this.state.value },
                bubbles: true,
                composed: true
            }));
        }

        updateValue(value) {
            if (!this.textbox || !this.dropdown) return;
            this.state.value = value;
            this.setAttribute('data-value', value);
            this.textbox.value = value;
            this.dropdown.value = value;
            if (!this.state.options.some(opt => opt.value === value)) {
                this.state.options.push({ value, text: value });
                this.syncOptionsWithSelect();
            }
        }

        updatePlaceholder(placeholder) {
            if (this.textbox) {
                this.state.placeholder = placeholder;
                this.textbox.placeholder = placeholder;
            }
        }

        disconnectedCallback() {
            if (this.textbox) {
                this.textbox.removeEventListener('input', this.handleTextInput);
                this.textbox.removeEventListener('keypress', this.handleKeyPress);
            }
            if (this.dropdown) {
                this.dropdown.removeEventListener('change', this.handleSelectChange);
            }
            this.textbox = null;
            this.dropdown = null;
            this.state = null;
        }
    }

    if (!customElements.get('combo-input')) {
        customElements.define('combo-input', CustomSelectInput);
    }
    
    return document.createElement('combo-input');
};
