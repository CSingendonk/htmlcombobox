/**
 * Creates a custom select input element that can be used in web applications.
 * The custom select input element provides a more flexible and customizable alternative to the standard HTML `<select>` element.
 * It allows for dynamic addition of options, custom styling, and event handling.
 * @author CSingendonk
 * @returns {HTMLElement} A custom select input element.
 */
const createCustomSelectInput = () => {
    class CustomSelectInput extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
            this.state = {
                value: '',
                options: [],
                placeholder: ''
            };
            this.textbox = null;
            this.dropdown = null;
            this.newOptionButton = null;
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
        }

        initializeState() {
            this.textbox = this.shadowRoot.querySelector('input');
            this.dropdown = this.shadowRoot.querySelector('select');
            this.setupEventListeners();
        }

        initializeAttributes() {
            if (!this.getAttribute('data-options')) {
                this.setAttribute('data-options', "[Enter/Select an option: , Option1:Option1, 2:'Option 2',Option 3:3]");
            }
            if (!this.getAttribute('data-placeholder')) {
                this.setAttribute('data-placeholder', "");
            }
            if (!this.getAttribute('data-value')) {
                this.setAttribute('data-value', "");
            }
            if (!this.getAttribute('data-id')) {
                this.setAttribute('data-id', "");
            }
            if (!this.getAttribute('data-class')) {
                this.setAttribute('data-class', "");
            }
            if (!this.getAttribute('data-style')) {
                this.setAttribute('data-style', "");
            }


            this.state.placeholder = this.getAttribute('data-placeholder');
            this.state.options = this.parseOptions(this.getAttribute('data-options'));
            this.state.value = this.getAttribute('data-value') || '';
            this.id = this.getAttribute('data-id');
            this.className = this.getAttribute('data-class');
            this.styles = this.getAttribute('data-style');
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
                this.shadowRoot.querySelectorAll('button').forEach(b => {
                    if (b.id === 'newOptionButton') {
                        this.a = true;
                    }
                });
                if (!this.a) {
                    this.showNewOptionButton();
                }
            }
            this.dropdown.style.width = '90%';
            this.boundShowOptions = this.showOptions.bind(this);
        }

        showOptions(_e) {
            this.dropdown.showPicker();
        }

        // attribute should be a string representing an array of values as written in javascript syntax like: <... data-options="[1,2,3,a,b,c]" ...> , the object property should be in the format of an array of objects like: this.state.options = [{value:'1', text:'option1'}, {value: 1, text: 'number option 1'}, ... ]
        // optionsData can be an array of strings or an array of strings that could be parsed into objects, if it is an array of objects, the object property should be in the format of an array of objects like: this.state.options = [{value:'1', text:'option1'}, {value: 1, text: 'number option 1'}, ... ] 
        // the arg will be "[a,b,c]" or ["a", "b", "c"] or  ['\'1\':option1', '1:number option 1', ... ]
        // the result should be an array of objects like: this.state.options = [{value:'1', text:'option1'}, {value: 1, text: 'number option 1'}, ... ]
        parseOptions(optionsData) {
            if (!this.getAttribute('data-options') && !optionsData) {
                return this.getDefaultOptions();
            }

            let options = [];
            let opts = [];

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
            <style> select { border: none; border-right: 1px solid #ccc; padding: 5px; width: 100%; } select:hover {border: inherit;} </style>
<label for="inpttxt" style="max-width:200px; contain: layout; z-index: 0;position: relative; display: inline-flex; height: auto;width: 197px;min-inline-size: fit-content;">
    <select id="Level1" style="/*! max-Width:fit-content; */ /*! height: 15px; */ /*! margin: auto 1px; */ position: absolute; top: auto; left: auto; min-Width:fit-content;width: fit-content;height: auto; /*! margin: auto 1px; */ position: absolute; top: 0; left: auto;right: 0;bottom: 5%;"><option value=""></option><option value="1">Option 1</option><option value="2">Option 2</option><option value="3">Option 3</option></select>
    <span style="z-index: 2;height: 18px;" id="lvl1o3">
        <input type="text" id="i1" value="default" name="inpttxt" placeholder="" style="z-index: 3; /*! width: 90%; *//*! min-width: auto; *//*! margin: auto; */position: absolute;top: 0;left: 0;right: 0;bottom: 0;">
    </span>
</label>`;
        }

        setupEventListeners() {
            const boundText = this.handleTextInput.bind(this.textbox);
            const boundKeyPress = this.handleKeyPress.bind(this.textbox);
            const boundSelectChange = this.handleSelectChange.bind(this.dropdown);

            if (!this.textbox || !this.dropdown) return;
            this.textbox.addEventListener('input', boundText);
            this.textbox.addEventListener('keydown', boundKeyPress);
            this.dropdown.addEventListener('change', this.handleSelectChange);
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
            this.shadowRoot.appendChild(hoverStyle);
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

            this.boundnewoptclick = this.#newOptionButton_click.bind(this);
            newOptionButton.addEventListener('click', this.boundnewoptclick);
            this.dropdown.addEventListener('focus', () => { this.textbox.focus(); });


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

    if (!customElements.get('combo-box')) {
        customElements.define('combo-box', CustomSelectInput);
    }
    return document.createElement('combo-box');
};

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    document.body?.appendChild(createCustomSelectInput());
} else {
    document.addEventListener('DOMContentLoaded', () => {
        document.body?.appendChild(createCustomSelectInput());
    });
}
