// js/generator.js
import { characterState } from './state.js';
import { SPECTERS, PATHS, VOCATIONS, SKILLS, AFFIRMATION_WORDS, ITEMS, NAMES } from './data.js';

export function generateRandomCharacter() {
    characterState.reset();

    characterState.name = pickRandom(NAMES || ["Kael", "Lyra", "Orin", "Sera", "Dante", "Nex"]);
    characterState.specter = pickRandom(Object.keys(SPECTERS));
    
    if (Math.random() < 0.5) {
        characterState.path = pickRandom(Object.keys(PATHS));
    } else {
        characterState.vocation = pickRandom(Object.keys(VOCATIONS));
    }

    // Distribui 4 pontos de atributo (máx 2 por atributo)
    const attrKeys = ["vigor", "dinamismo", "razao", "determinacao"];
    let points = characterState.attributePoints;
    const focusAttrs = shuffle(attrKeys).slice(0, 2);
    
    while (points > 0) {
        let distributed = false;
        for (const attr of focusAttrs) {
            if (points > 0 && characterState.attributes[attr] < 2) {
                characterState.attributes[attr]++;
                points--;
                distributed = true;
            }
        }
        if (!distributed) {
            const remaining = attrKeys.filter(a => characterState.attributes[a] < 2);
            if (remaining.length > 0) {
                characterState.attributes[pickRandom(remaining)]++;
                points--;
            } else {
                break;
            }
        }
    }
    characterState.attributePoints = 0;

    characterState.skills = shuffle(SKILLS).slice(0, 5);
    characterState.affirmationWords = shuffle(AFFIRMATION_WORDS).slice(0, 2);

    // Pega itens de todas as categorias misturadas
    let allItems = [];
    Object.values(ITEMS_CATEGORIES).forEach(list => allItems.push(...list));
    characterState.inventory = shuffle(allItems).slice(0, 3);

    characterState.calculateDerivedValues();
    
    return characterState;
}

function pickRandom(arr) {
    if (!arr || arr.length === 0) return "";
    return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}