// js/ui.js
import { characterState } from './state.js';
import { SPECTERS, PATHS, VOCATIONS, SKILLS, AFFIRMATION_WORDS, ITEMS } from './data.js';

export const UI = {
    elements: {},
    rollMode: 'attr', // 'attr' ou 'skill'

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
            validationBox: document.getElementById('validation-box'),

            // Elementos de Rolagem
            btnRollAttr: document.getElementById('btn-roll-attr'),
            btnRollSkill: document.getElementById('btn-roll-skill'),
            rollAttrContainer: document.getElementById('roll-attr-container'),
            rollSkillContainer: document.getElementById('roll-skill-container'),
            rollAttrSelect: document.getElementById('roll-attr-select'),
            rollSkillSelect: document.getElementById('roll-skill-select'),
            btnExecuteRoll: document.getElementById('btn-execute-roll'),
            rollResult: document.getElementById('roll-result')
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

        // Lógica de Rolagem
        if (this.elements.btnRollAttr) {
            this.elements.btnRollAttr.addEventListener('click', () => {
                this.rollMode = 'attr';
                this.elements.btnRollAttr.classList.add('active');
                this.elements.btnRollSkill.classList.remove('active');
                this.elements.rollAttrContainer.style.display = '';
                this.elements.rollSkillContainer.style.display = 'none';
            });
        }
        if (this.elements.btnRollSkill) {
            this.elements.btnRollSkill.addEventListener('click', () => {
                this.rollMode = 'skill';
                this.elements.btnRollSkill.classList.add('active');
                this.elements.btnRollAttr.classList.remove('active');
                this.elements.rollSkillContainer.style.display = '';
                this.elements.rollAttrContainer.style.display = 'none';
                this.populateSkillSelect();
            });
        }
        if (this.elements.btnExecuteRoll) {
            this.elements.btnExecuteRoll.addEventListener('click', () => this.executeRoll());
        }

        if (this.elements.btnRandom) {
            this.elements.btnRandom.addEventListener('click', () => {
                if (window.generateRandomCharacter) {
                    window.generateRandomCharacter();
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

        // --- TROCA DE JSON PARA PDF ---
        if (this.elements.btnSave) {
            this.elements.btnSave.addEventListener('click', () => this.exportPDF());
        }

        if (this.elements.btnLoad) {
            // Mantido o carregamento via JSON, mas escondido/opcional
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
                                characterState.calculateDerivedValues();
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

    // --- LÓGICA DE ROLAGEM ---
    populateSkillSelect() {
        const sel = this.elements.rollSkillSelect;
        if (!sel) return;
        sel.innerHTML = '<option value="">Selecione a Perícia...</option>';
        characterState.skills.forEach(s => {
            const o = document.createElement('option');
            o.value = s; o.textContent = s;
            sel.appendChild(o);
        });
    },

    executeRoll() {
        const d12 = Math.floor(Math.random() * 12) + 1;
        let tipo, nome, modAttr = 0, modPericia = 0, volume = characterState.volume;

        if (this.rollMode === 'attr') {
            const attr = this.elements.rollAttrSelect.value;
            if (!attr) { this.showStatus("Escolha um atributo.", "error"); return; }
            tipo = 'Atributo';
            nome = attr.charAt(0).toUpperCase() + attr.slice(1);
            modAttr = this.rollDados(characterState.attributes[attr] || 0, 4);
        } else {
            const skill = this.elements.rollSkillSelect.value;
            if (!skill) { this.showStatus("Escolha uma perícia.", "error"); return; }
            tipo = 'Perícia';
            nome = skill;
            // Regra do livro: Perícia começa com 1d6
            modPericia = this.rollDados(1, 6); 
        }

        const total = d12 + modAttr + modPericia + volume;

        // Resultados Absolutos do d12
        let absoluto = "";
        if (d12 === 1)  absoluto = "💥 <b>Desastre Absoluto</b> — uma complicação narrativa acontece.";
        if (d12 === 6)  absoluto = "🌀 <b>Complicação Absoluta</b> — algo dificulta a cena.";
        if (d12 === 12) absoluto = "✨ <b>Momento Lendário</b> — algo extraordinário acontece.";

        const box = this.elements.rollResult;
        if (box) {
            box.style.display = 'block';
            box.innerHTML = `
                <div style="font-family:Cinzel,serif;font-size:1.1rem;color:var(--gold);">${tipo}: ${nome}</div>
                <div style="margin-top:0.5rem;font-size: 1.1rem;">
                    🎲 d12: <b>${d12}</b> 
                    ${modAttr ? ` + Atributo: <b>${modAttr}</b>` : ''}
                    ${modPericia ? ` + Perícia: <b>${modPericia}</b>` : ''}
                    + Volume: <b>${volume}</b>
                </div>
                <div style="font-family:Cinzel,serif;font-size:2rem;color:#fff;margin-top:0.4rem;text-shadow: 0 0 10px var(--gold);">
                    Total: ${total}
                </div>
                ${absoluto ? `<div style="margin-top:0.6rem;font-style:italic;color:var(--text-muted);border-top:1px solid #333;padding-top:0.5rem;">${absoluto}</div>` : ''}
            `;
        }
    },

    rollDados(qtd, faces) {
        if (!qtd) return 0;
        let s = 0;
        for (let i = 0; i < qtd; i++) s += Math.floor(Math.random() * faces) + 1;
        return s;
    },

    // --- EXPORTAÇÃO PDF ---
    exportPDF() {
        if (typeof html2pdf === 'undefined') {
            this.showStatus("Biblioteca de PDF não carregada. Verifique a internet.", "error");
            return;
        }
        
        // Cria uma tela limpa para o PDF
        const win = window.open('', '_blank');
        win.document.write(this.buildPrintHTML());
        win.document.close();
        win.onload = () => {
            if (win.html2pdf) {
                win.html2pdf().from(win.document.body).set({
                    margin: 10,
                    filename: `Ficha_${characterState.name || 'Arquivista'}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                }).save().then(() => win.close());
            } else {
                win.print();
            }
        };
    },

    buildPrintHTML() {
        const a = characterState.attributes;
        const d = characterState.derived;
        const nomeAttr = { vigor:'Vigor', dinamismo:'Dinamismo', razao:'Razão', determinacao:'Determinação' };
        
        return `<!DOCTYPE html><html><head><meta charset="utf-8">
        <title>Ficha - ${characterState.name || 'Arquivista'}</title>
        <style>
            body { font-family: 'Lora', serif; color:#1a1a1a; padding:20px; background: #f9f6f0; }
            h1 { font-family: 'Cinzel', serif; color:#5a4a20; text-align:center; border-bottom: 2px solid #5a4a20; padding-bottom: 10px; }
            h2 { font-family: 'Cinzel', serif; color:#5a4a20; border-bottom:1px solid #ccc; margin-top:20px; font-size:14pt;}
            .row { margin:6px 0; font-size: 11pt; }
            .grid { display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:10px; margin-bottom: 15px; }
            .box { border:1px solid #aaa; padding:10px; border-radius:6px; text-align: center; background: #fff; }
            .lbl { color:#666; font-size:9pt; text-transform:uppercase; letter-spacing:1px; display: block;}
            .val { font-size:16pt; color:#3a2a00; font-weight:bold; }
            ul { margin:4px 0 0 18px; padding:0; font-size: 11pt;}
            li { margin-bottom: 4px; }
            .desc { font-style: italic; color: #444; margin-top: 15px; }
        </style></head><body>
        
        <h1>Biblioteca da 5ª Avenida</h1>
        <p style="text-align:center; font-size: 12pt; font-weight: bold; color: #5a4a20;">
            Ficha de Arquivista — Volume ${characterState.volume}<br>
            ${characterState.name || 'Sem nome'}
        </p>

        <h2>Atributos</h2>
        <div class="grid">
            ${Object.entries(a).map(([k,v]) => `<div class="box"><span class="lbl">${nomeAttr[k]}</span><span class="val">${v}d4</span></div>`).join('')}
        </div>

        <h2>Valores Básicos</h2>
        <div class="grid">
            <div class="box"><span class="lbl">HP (Vida)</span><span class="val">${d.vida}</span></div>
            <div class="box"><span class="lbl">PI Máx (Ímpeto)</span><span class="val">${d.impetoMax}</span></div>
            <div class="box"><span class="lbl">Iniciativa</span><span class="val">1d12 + ${d.iniciativa}</span></div>
            <div class="box"><span class="lbl">Deslocamento</span><span class="val">${d.deslocamento}m</span></div>
        </div>

        <h2>Identidade</h2>
        <div class="row"><b>Espectro:</b> ${(SPECTERS[characterState.specter]||{}).name || '—'}</div>
        <div class="row"><b>Caminho:</b> ${(PATHS[characterState.path]||{}).name || '—'}</div>
        <div class="row"><b>Vocação:</b> ${(VOCATIONS[characterState.vocation]||{}).name || '—'}</div>

        <h2>Perícias</h2>
        <ul>${characterState.skills.map(s => `<li>${s} (1d6)</li>`).join('') || '<li>—</li>'}</ul>

        <h2>Palavras de Afirmação</h2>
        <ul>${characterState.affirmationWords.map(s => `<li>${s}</li>`).join('') || '<li>—</li>'}</ul>

        <h2>Inventário</h2>
        <ul>${characterState.inventory.map(s => `<li>${s}</li>`).join('') || '<li>—</li>'}</ul>

        <p class="desc">"Entre o que você perdeu e o que ainda não encontrou, existe um lugar..."</p>
        </body></html>`;
    },

    // --- RENDERIZAÇÃO BÁSICA ---
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
            btn.className = `chip ${isSelected ? 'selected' : ''}`;
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
        const allItems = Object.values(ITEMS).flat();
        
        allItems.forEach(item => {
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