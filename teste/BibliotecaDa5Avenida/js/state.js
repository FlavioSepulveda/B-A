export const characterState = {
    // Dados Básicos
    name: "",
    volume: 1,
    
    // Escolhas Principais
    specter: "",
    path: "",
    vocation: "",
    favoriteWeapon: "",
    favoriteWeaponCategory: "",
    
    // Atributos (base 0d4, +4d4 para distribuir)
// No topo do characterState, altere os atributos:
    attributes: {
        vigor: 0,
        dinamismo: 0,
        razao: 0,
        determinacao: 0
    },
    attributePoints: 4, // Pontos de d4 para distribuir

    // Perícias (escolher 5)
    skills: [],
    
    // Habilidades
    affirmationWords: [],
    equippedEffectPhrases: [], // Frases de Efeito Equipadas
    
    // Equipamento
    inventory: [], // Itens escolhidos
    inventoryCapacity: 5,

    // Valores Derivados (calculados)
    derived: {
        vida: 0,
        impetoMax: 0,
        iniciativa: 0,
        deslocamento: 0
    },

    // Funções de Lógica
    reset: function() {
        this.name = "";
        this.volume = 1;
        this.specter = "";
        this.path = "";
        this.vocation = "";
        this.favoriteWeapon = "";
        this.favoriteWeaponCategory = "";
        this.attributes = {
            forca: 0,
            destreza: 0,
            constituicao: 0,
            intelecto: 0,
            vontade: 0,
            percepcao: 0
        };
        this.attributePoints = 4;
        this.skills = [];
        this.affirmationWords = [];
        this.equippedEffectPhrases = [];
        this.inventory = [];
        this.inventoryCapacity = 5;
        this.derived = {
            vida: 0,
            impetoMax: 0,
            iniciativa: 0,
            deslocamento: 0
        };
    },

    // --- Lógica de Atributos ---
    
    // Distribui um ponto de d4 em um atributo específico
    distributeAttribute: function(attributeName) {
        if (this.attributePoints > 0) {
            // Verifica o limite de 2d4 na criação (conforme regra do livro)
            if (this.attributes[attributeName] < 2) {
                this.attributes[attributeName] += 1;
                this.attributePoints -= 1;
                this.calculateDerivedValues();
                return true;
            } else {
                console.warn(`O atributo ${attributeName} já atingiu o limite de 2d4 na criação.`);
                return false;
            }
        } else {
            console.warn("Não há pontos de atributo disponíveis para distribuir.");
            return false;
        }
    },

    // Remove um ponto de um atributo (para correção)
    removeAttribute: function(attributeName) {
        if (this.attributes[attributeName] > 0) {
            this.attributes[attributeName] -= 1;
            this.attributePoints += 1;
            this.calculateDerivedValues();
            return true;
        }
        return false;
    },

    // --- Lógica de Perícias ---

    // Adiciona uma perícia (limite de 5 na criação)
    addSkill: function(skillName) {
        if (this.skills.length < 5) {
            if (!this.skills.includes(skillName)) {
                this.skills.push(skillName);
                return true;
            } else {
                console.warn(`A perícia ${skillName} já foi adicionada.`);
                return false;
            }
        } else {
            console.warn("Você já escolheu o máximo de 5 perícias iniciais.");
            return false;
        }
    },

    // Remove uma perícia
    removeSkill: function(skillName) {
        const index = this.skills.indexOf(skillName);
        if (index > -1) {
            this.skills.splice(index, 1);
            return true;
        }
        return false;
    },

    // --- Lógica de Habilidades ---

    // Adiciona uma Palavra de Afirmação (limite inicial de 2 no Volume I)
    addAffirmationWord: function(wordName) {
        if (this.affirmationWords.length < 2) {
            if (!this.affirmationWords.includes(wordName)) {
                this.affirmationWords.push(wordName);
                return true;
            }
            return false;
        }
        console.warn("Você já escolheu as 2 Palavras de Afirmação iniciais.");
        return false;
    },

    // --- Lógica de Equipamento ---

    // Adiciona um item ao inventário
    addItem: function(itemName) {
        // O inventário inicial possui 3 itens, mas a capacidade real é baseada em Constituição
        // A regra diz: Capacidade = 5 + dados de Constituição
        const capacity = 5 + this.attributes.constituicao;
        
        if (this.inventory.length < capacity) {
            this.inventory.push(itemName);
            this.inventoryCapacity = capacity;
            return true;
        } else {
            console.warn(`Inventário cheio. Capacidade máxima: ${capacity}`);
            return false;
        }
    },

    // Remove um item do inventário
    removeItem: function(itemName) {
        const index = this.inventory.indexOf(itemName);
        if (index > -1) {
            this.inventory.splice(index, 1);
            return true;
        }
        return false;
    },

    // --- Cálculos de Valores Derivados ---

       calculateDerivedValues: function() {
        // Vida = 10 + (5 × Volume) + Determinação
        this.derived.vida = 10 + (5 * this.volume) + (this.attributes.determinacao || 0);

        // Ímpeto = 5 + (3 × Volume) + Razão + bônus
        let impetoBonus = 0; 
        if (this.path === "mago") impetoBonus = 2 * this.volume; // O path deve ser minúsculo como no data.js
        this.derived.impetoMax = 5 + (3 * this.volume) + (this.attributes.razao || 0) + impetoBonus;

        // Iniciativa = Dinamismo + Volume + bônus
        let iniciativaBonus = 0;
        if (this.path === "assassino") iniciativaBonus += 2;
        if (this.path === "atirador") iniciativaBonus += 1;
        this.derived.iniciativa = (this.attributes.dinamismo || 0) + this.volume + iniciativaBonus;

        // Deslocamento
        const deslocamentos = {
            "guerreiro": 6, "mago": 7, "suporte": 6.5, "assassino": 8, "atirador": 7,
            "cronista": 6, "selador": 5.5, "guardiao_memorias": 6, 
            "investigador_sombras": 8, "cartografo": 7, "ecoista": 6.5
        };
        this.derived.deslocamento = deslocamentos[this.path] || deslocamentos[this.vocation] || 6;

        // Inventário = 5 + Vigor
        this.inventoryCapacity = 5 + (this.attributes.vigor || 0);
    },

    // --- Validação da Ficha ---

    isComplete: function() {
        // Verifica se todos os passos obrigatórios foram cumpridos
        const hasAttributes = this.attributePoints === 0;
        const hasSkills = this.skills.length === 5;
        const hasWords = this.affirmationWords.length === 2;
        const hasIdentity = this.specter !== "" && (this.path !== "" || this.vocation !== "");
        const hasItems = this.inventory.length >= 3; // Pelo menos os 3 iniciais

        if (!hasAttributes) console.warn("Distribua todos os 4 pontos de atributo.");
        if (!hasSkills) console.warn("Escolha exatamente 5 perícias.");
        if (!hasWords) console.warn("Escolha exatamente 2 Palavras de Afirmação.");
        if (!hasIdentity) console.warn("Escolha seu Espectro e seu Caminho/Vocação.");
        if (!hasItems) console.warn("Escolha seus 3 itens iniciais.");

        return hasAttributes && hasSkills && hasWords && hasIdentity && hasItems;
    },

    // --- Progressão ---

    levelUp: function() {
        this.volume += 1;
        
        // Regras de Progressão (Página 33)
        // 1. Vida, Ímpeto e Iniciativa aumentam (recalculados abaixo)
        // 2. Aprende 1 nova Palavra de Afirmação (adicionar manualmente)
        // 3. Aprende 2 novas Frases de Efeito (a partir do Volume II)
        // 4. Aumenta uma Perícia em +1d6 ou aprende nova (adicionar manualmente)
        // 5. Desbloqueia próxima habilidade do Caminho/Vocação
        
        this.calculateDerivedValues();
        console.log(`Subiu para o Volume ${this.volume}. Recalcule seus valores derivados.`);
        
        // Retorna um objeto com as instruções para o jogador
        return {
            newVolume: this.volume,
            message: "Escolha 1 nova Palavra de Afirmação, 2 Frases de Efeito (se Vol. >= 2) e melhore uma Perícia."
        };
    }
};

// Exemplo de uso:
// characterState.name = "Kael";
// characterState.specter = "Ígneo";
// characterState.path = "Guerreiro";
// characterState.distributeAttribute('forca');
// characterState.distributeAttribute('constituicao');
// characterState.addSkill('Luta');
// characterState.addAffirmationWord('Registrar');
// characterState.addAffirmationWord('Incendiar');
// characterState.addItem('Espada Longa');
// characterState.addItem('Armadura de Couro');
// characterState.addItem('Kit de Primeiros Socorros');
// characterState.calculateDerivedValues();
// console.log(characterState.isComplete());