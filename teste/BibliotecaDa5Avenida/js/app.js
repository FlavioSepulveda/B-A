// js/app.js
import { characterState } from './state.js';
import { UI } from './ui.js';
import { generateRandomCharacter } from './generator.js';

window.generateRandomCharacter = () => {
    generateRandomCharacter();
    UI.renderAll();
};

window.characterState = characterState;

document.addEventListener('DOMContentLoaded', () => {
    try {
        UI.init();
        characterState.calculateDerivedValues();
        UI.renderAll();
        console.log('✅ Sistema iniciado com sucesso.');
    } catch (error) {
        console.error('❌ Erro ao iniciar:', error);
        alert('Erro no console. Aperte F12 para ver os detalhes.');
    }
});