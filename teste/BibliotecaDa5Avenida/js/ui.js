// js/ui.js
import { characterState } from './state.js';
import { SPECTERS, PATHS, VOCATIONS, SKILLS, AFFIRMATION_WORDS, ITEMS_CATEGORIES } from './data.js';

export const UI = {
    elements: {},

    init() {
        this.cacheElements();
        this.bindEvents();
        this.renderAll();
    },

    cacheElements() {
        this.elements = {
            nameInput: document.getElementById('char-name'),
            volumeDisplay: document.getElementById('char-volume'),
            
            specterSelect: document.getElementById('specter-select'),
            pathSelect: document.getElementById('path-select'),
            vocationSelect: document.getElementById('vocation-select'),
            specterInfo: document.getElementById('specter-info'),
            pathInfo: document.getElementById('path-info'),
            
            attributePointsDisplay: document.getElementById('attribute-points'),
            attributeButtons: document.querySelectorAll('[data-attribute]'),
            attributeValues: document.querySelectorAll('[data-attribute-value]'),
            
            skillsContainer: document.getElementById('skills-container'),
            skillsSelected: document.getElementById('skills-selected'),
            
            wordsContainer: document.getElementById('words-container'),
            wordsSelected: document.getElementById('words-selected'),
            
            itemsContainer: document.getElementById('items-container'),
            inventoryCapacity: document.getElementById('inventory-capacity'),
            
            vidaDisplay: document.getElementById('vida-value'),
            impetoDisplay: document.getElementById('impeto-value'),
            iniciativaDisplay: document.getElementById('iniciativa-value'),
            deslocamentoDisplay: document.getElementById('deslocamento-value'),
            
            btnReset: document.getElementById('btn-reset'),
            btnSave: document.getElementById('btn-save'),
            btnLoad: document.getElementById('btn-load'),
            btnRandom: document.getElementById('btn-random'),
            btnLevelUp: document.getElementById('btn-levelup'),
            
            statusMessage: document.getElementById('status-message'),
            validationBox: document.getElementById('validation-box')
        };
    },

    bindEvents() {
        if (this.elements.nameInput) {
            this.elements.nameInput.addEventListener('input', (e) => {
                characterState.name = e.target.value;
                this.updateValidation();
            });
        }

        if (this.elements.specterSelect) {
            this.elements.specterSelect.addEventListener('change', (e) => {
                characterState.specter = e.target.value;
                this.renderSpecterInfo();
                this.updateValidation();
            });
        }

        if (this.elements.pathSelect) {
            this.elements.pathSelect.addEventListener('change', (e) => {
                characterState.path = e.target.value;
                if (characterState.path) {
                    characterState.vocation = "";
                    this.elements.vocationSelect.value = "";
                }
                this.renderPathInfo();
                characterState.calculateDerivedValues();
                this.renderDerivedValues();
                this.updateValidation();
            });
        }

        if (this.elements.vocationSelect) {
            this.elements.vocationSelect.addEventListener('change', (e) => {
                characterState.vocation = e.target.value;
                if (characterState.vocation) {
                    characterState.path = "";
                    this.elements.pathSelect.value = "";
                }
                this.renderPathInfo();
                characterState.calculateDerivedValues();
                this.renderDerivedValues();
                this.updateValidation();
            });
        }

        if (this.elements.attributeButtons) {
            this.elements.attributeButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const attr = btn.dataset.attribute;
                    const action = btn.dataset.action;
                    
                    if (action === 'add') characterState.distributeAttribute(attr);
                    if (action === 'remove') characterState.removeAttribute(attr);
                    
                    this.renderAttributes();
                    this.renderDerivedValues();
                    this.updateValidation();
                });
            });
        }

        if (this.elements.btnRandom) {
            this.elements.btnRandom.addEventListener('click', () => {
                if (window.generateRandomCharacter) {
                    window.generateRandomCharacter();
                    this.renderAll();
                    this.showStatus("Personagem gerado aleatoriamente.", "info");
                }
            });
        }

        if (this.elements.btnLevelUp) {
            this.elements.btnLevelUp.addEventListener('click', () => {
                const result = characterState.levelUp();
                this.renderAll();
                this.showStatus(result.message, "info");
            });
        }

        if (this.elements.btnSave) {
            this.elements.btnSave.addEventListener('click', () => {
                const data = characterState.exportData ? characterState.exportData() : characterState;
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `arquivista-${characterState.name || 'sem-nome'}.json`;
                a.click();
                URL.revokeObjectURL(url);
                this.showStatus("Ficha exportada com sucesso.", "success");
            });
        }

        if (this.elements.btnLoad) {
            this.elements.btnLoad.addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        try {
                            const data = JSON.parse(ev.target.result);
                            if (characterState.importData) {
                                characterState.importData(data);
                            } else {
                                Object.assign(characterState, data);
                            }
                            this.renderAll();
                            this.showStatus("Ficha carregada com sucesso.", "success");
                        } catch (err) {
                            this.showStatus("Erro ao carregar ficha: arquivo inválido.", "error");
                        }
                    };
                    reader.readAsText(file);
                };
                input.click();
            });
        }

        if (this.elements.btnReset) {
            this.elements.btnReset.addEventListener('click', () => {
                if (confirm("Tem certeza que deseja resetar a ficha?")) {
                    characterState.reset();
                    this.renderAll();
                    this.showStatus("Ficha resetada.", "info");
                }
            });
        }
    },

    renderAll() {
        this.renderName();
        this.renderVolume();
        this.renderSelects();
        this.renderAttributes();
        this.renderSkills();
        this.renderWords();
        this.renderItems();
        this.renderDerivedValues();
        this.renderSpecterInfo();
        this.renderPathInfo();
        this.updateValidation();
    },

    renderName() {
        if (this.elements.nameInput) this.elements.nameInput.value = characterState.name;
    },

    renderVolume() {
        if (this.elements.volumeDisplay) this.elements.volumeDisplay.textContent = `Volume ${characterState.volume}`;
    },

    renderSelects() {
        const populate = (el, data, defaultText, currentVal) => {
            if (!el) return;
            el.innerHTML = `<option value="">${defaultText}</option>`;
            Object.keys(data).forEach(key => {
                const opt = document.createElement('option');
                opt.value = key;
                opt.textContent = data[key].name;
                if (currentVal === key) opt.selected = true;
                el.appendChild(opt);
            });
        };

        populate(this.elements.specterSelect, SPECTERS, "-- Escolha seu Espectro --", characterState.specter);
        populate(this.elements.pathSelect, PATHS, "-- Escolha seu Caminho --", characterState.path);
        populate(this.elements.vocationSelect, VOCATIONS, "-- Escolha sua Vocação --", characterState.vocation);
    },

    renderSpecterInfo() {
        if (!this.elements.specterInfo) return;
        const data = SPECTERS[characterState.specter];
        if (!data) {
            this.elements.specterInfo.innerHTML = '<em>Escolha um Espectro para ver os detalhes.</em>';
            return;
        }
        this.elements.specterInfo.innerHTML = `
            <strong>${data.name}</strong><br>
            <em>"${data.juramento}"</em><br><br>
            <b>Passivo:</b> ${data.passive}<br>
            <b>Ativo:</b> ${data.active}
        `;
    },

    renderPathInfo() {
        if (!this.elements.pathInfo) return;
        const data = PATHS[characterState.path] || VOCATIONS[characterState.vocation];
        if (!data) {
            this.elements.pathInfo.innerHTML = '<em>Escolha um Caminho ou Vocação.</em>';
            return;
        }
        this.elements.pathInfo.innerHTML = `
            <strong>${data.name}</strong><br>
            <b>Deslocamento:</b> ${data.deslocamento}m<br>
            <b>Armas Favoritas:</b> ${data.armasFavoritas.join(', ')}<br>
            <b>Benefícios:</b> ${data.beneficios}
        `;
    },

    renderAttributes() {
        this.elements.attributeValues.forEach(el => {
            const attr = el.dataset.attributeValue;
            el.textContent = `${characterState.attributes[attr] || 0}d4`;
        });

        if (this.elements.attributePointsDisplay) {
            this.elements.attributePointsDisplay.textContent = characterState.attributePoints;
        }

        this.elements.attributeButtons.forEach(btn => {
            const attr = btn.dataset.attribute;
            const action = btn.dataset.action;
            if (action === 'add') btn.disabled = characterState.attributePoints <= 0 || characterState.attributes[attr] >= 2;
            if (action === 'remove') btn.disabled = characterState.attributes[attr] <= 0;
        });
    },

    renderSkills() {
        if (!this.elements.skillsContainer) return;
        this.elements.skillsContainer.innerHTML = '';
        SKILLS.forEach(skill => {
            const isSelected = characterState.skills.includes(skill);
            const btn = document.createElement('button');
            btn.className = `chip ${isSelected ? 'selected' : ''}`; // Usando classe .chip
            btn.textContent = skill;
            btn.disabled = !isSelected && characterState.skills.length >= 5;
            btn.addEventListener('click', () => {
                if (isSelected) characterState.removeSkill(skill);
                else characterState.addSkill(skill);
                this.renderSkills();
                this.updateValidation();
            });
            this.elements.skillsContainer.appendChild(btn);
        });
        if (this.elements.skillsSelected) this.elements.skillsSelected.textContent = `${characterState.skills.length}/5`;
    },

    renderWords() {
        if (!this.elements.wordsContainer) return;
        this.elements.wordsContainer.innerHTML = '';
        AFFIRMATION_WORDS.forEach(word => {
            const isSelected = characterState.affirmationWords.includes(word);
            const btn = document.createElement('button');
            btn.className = `chip ${isSelected ? 'selected' : ''}`;
            btn.textContent = word;
            btn.disabled = !isSelected && characterState.affirmationWords.length >= 2;
            btn.addEventListener('click', () => {
                if (isSelected) {
                    const i = characterState.affirmationWords.indexOf(word);
                    if (i > -1) characterState.affirmationWords.splice(i, 1);
                } else {
                    characterState.addAffirmationWord(word);
                }
                this.renderWords();
                this.updateValidation();
            });
            this.elements.wordsContainer.appendChild(btn);
        });
        if (this.elements.wordsSelected) this.elements.wordsSelected.textContent = `${characterState.affirmationWords.length}/2`;
    },

    renderItems() {
        if (!this.elements.itemsContainer) return;
        this.elements.itemsContainer.innerHTML = '';
        ITEMS.forEach(item => {
            const isSelected = characterState.inventory.includes(item);
            const btn = document.createElement('button');
            btn.className = `chip ${isSelected ? 'selected' : ''}`;
            btn.textContent = item;
            btn.disabled = !isSelected && characterState.inventory.length >= characterState.inventoryCapacity;
            btn.addEventListener('click', () => {
                if (isSelected) characterState.removeItem(item);
                else characterState.addItem(item);
                this.renderItems();
                this.renderDerivedValues();
                this.updateValidation();
            });
            this.elements.itemsContainer.appendChild(btn);
        });
        if (this.elements.inventoryCapacity) this.elements.inventoryCapacity.textContent = `${characterState.inventory.length}/${characterState.inventoryCapacity}`;
    },

    renderDerivedValues() {
        if (this.elements.vidaDisplay) this.elements.vidaDisplay.textContent = characterState.derived.vida;
        if (this.elements.impetoDisplay) this.elements.impetoDisplay.textContent = characterState.derived.impetoMax;
        if (this.elements.iniciativaDisplay) this.elements.iniciativaDisplay.textContent = `1d12 + ${characterState.derived.iniciativa}`;
        if (this.elements.deslocamentoDisplay) this.elements.deslocamentoDisplay.textContent = `${characterState.derived.deslocamento}m`;
    },

    updateValidation() {
        if (!this.elements.validationBox) return;
        
        const checks = {
            name: characterState.name.trim() !== '',
            specter: characterState.specter !== '',
            pathOrVocation: characterState.path !== '' || characterState.vocation !== '',
            attributes: characterState.attributePoints === 0,
            skills: characterState.skills.length === 5,
            words: characterState.affirmationWords.length === 2,
            items: characterState.inventory.length >= 3
        };

        const allValid = Object.values(checks).every(v => v);

        this.elements.validationBox.innerHTML = `
            <ul>
                <li class="${checks.name ? 'ok' : ''}">Nome preenchido</li>
                <li class="${checks.specter ? 'ok' : ''}">Espectro escolhido</li>
                <li class="${checks.pathOrVocation ? 'ok' : ''}">Caminho/Vocação escolhido</li>
                <li class="${checks.attributes ? 'ok' : ''}">Atributos distribuídos</li>
                <li class="${checks.skills ? 'ok' : ''}">Perícias (${characterState.skills.length}/5)</li>
                <li class="${checks.words ? 'ok' : ''}">Palavras (${characterState.affirmationWords.length}/2)</li>
                <li class="${checks.items ? 'ok' : ''}">Itens (${characterState.inventory.length}/3 min)</li>
            </ul>
            <p class="validation-summary ${allValid ? 'valid' : 'invalid'}">
                ${allValid ? '✅ Pronto para jogar!' : '⏳ Ficha incompleta'}
            </p>
        `;
    },

    showStatus(message, type = 'info') {
        if (!this.elements.statusMessage) return;
        this.elements.statusMessage.textContent = message;
        this.elements.statusMessage.className = `status-message ${type}`;
        setTimeout(() => {
            this.elements.statusMessage.textContent = '';
            this.elements.statusMessage.className = 'status-message';
        }, 4000);
    }
};