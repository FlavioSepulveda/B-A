export const NAMES = ["Kael", "Lyra", "Orin", "Sera", "Dante", "Vesper", "Nyx", "Thane", "Elara", "Cyrus", "Mira", "Aldric", "Isolde", "Rook", "Selene", "Vane"];

export const SPECTERS = {
    igneo: { name: "Ígneo", juramento: "Toda conquista exige um sacrifício.", passive: "+1d4 em um atributo, -1d4 em outro.", active: "Troca equivalente." },
    celeste: { name: "Celeste", juramento: "Conhecimento supera força.", passive: "+1 perícia (1d6).", active: "Controle mental." },
    viridiano: { name: "Viridiano", juramento: "Enquanto houver vida, há esperança.", passive: "Permanece consciente a 0 PV por 1 turno.", active: "Cura sobrenatural." },
    solar: { name: "Solar", juramento: "Nenhum caminho é definitivo.", passive: "Substitui dado por Eco.", active: "Liberdade de restrições." },
    indigo: { name: "Índigo", juramento: "Toda resposta gera uma nova pergunta.", passive: "Descartar 9-12 ganha informação.", active: "Reescreve a realidade." },
    alabastro: { name: "Alabastro", juramento: "Ninguém deve prevalecer.", passive: "-1d4 defesa, +1d4 ataque.", active: "Equilíbrio e proteção." }
};

export const PATHS = {
    guerreiro: { name: "Guerreiro", deslocamento: 6, armasFavoritas: ["Soco", "Espada", "Machado"], beneficios: "+1d4 Vigor, +1d4 Determinação." },
    mago: { name: "Mago", deslocamento: 7, armasFavoritas: ["Grimório", "Cajado", "Orbe"], beneficios: "+2 PI, +1d4 Razão, +1d4 Determinação." },
    suporte: { name: "Suporte", deslocamento: 6.5, armasFavoritas: ["Ritualísticos"], beneficios: "+1 Auxílio, +2 Inventário, +1d4 Razão." },
    assassino: { name: "Assassino", deslocamento: 8, armasFavoritas: ["Adaga", "Agulha"], beneficios: "+2 Iniciativa, +1d4 Dinamismo." },
    atirador: { name: "Atirador", deslocamento: 7, armasFavoritas: ["Arco", "Besta"], beneficios: "+2 PI, +1 Iniciativa, +1d4 Dinamismo." }
};

export const VOCATIONS = {
    cronista: { name: "Cronista", deslocamento: 6, armasFavoritas: ["Pena"], beneficios: "+1d6 Investigar, +1d6 Pesquisa, +1d4 Razão." },
    selador: { name: "Selador", deslocamento: 5.5, armasFavoritas: ["Martelo"], beneficios: "+1d6 Arcanismo, +1d4 Determinação." },
    guardiao_memorias: { name: "Guardião de Memórias", deslocamento: 6, armasFavoritas: ["Lâmpada"], beneficios: "+1d6 Persuasão, +1d4 Determinação." },
    investigador_sombras: { name: "Investigador", deslocamento: 8, armasFavoritas: ["Lupa"], beneficios: "+1d6 Intuição, +1d6 Invasão, +1d4 Dinamismo." },
    cartografo: { name: "Cartógrafo", deslocamento: 7, armasFavoritas: ["Bússola"], beneficios: "+1d6 Imaginação, +1d4 Razão." },
    ecoista: { name: "Ecoísta", deslocamento: 6.5, armasFavoritas: ["Espelho"], beneficios: "+1d6 Arcanismo, +1d6 História, +1d4 Dinamismo." }
};

export const SKILLS = [
    "Barganha", "Combate", "Tecnologia", "Resistência", 
    "Intuição", "Medicina", "Investigar", "Invasão", 
    "Pesquisa", "Arcanismo", "Imaginação", "História", 
    "Persuasão", "Intimidação", "Enganação", "Leitura"
];

export const AFFIRMATION_WORDS = ["Registrar", "Ecoar", "Revelar", "Ancorar", "Selar", "Silenciar", "Esquecer", "Espelhar", "Incendiar", "Analisar", "Regenerar", "Purificar", "Florescer", "Blindar", "Conter", "Refletir", "Impulsionar", "Avançar", "Disparar", "Distorcer", "Materializar", "Duplicar", "Ocultar", "Enfraquecer", "Fortalecer", "Atrair", "Repelir", "Desfazer", "Ampliar", "Convergir", "Fragmentar", "Consumir", "Mapear", "Domesticar", "Cultivar", "Rastrear", "Disfarçar", "Destrancar", "Fortificar", "Despertar", "Vincular", "Apagar"];

export const ITEMS = {
    "Armas": ["Faca", "Pena de Prata", "Lâmina de Tinta", "Machado do Arquivista", "Martelo de Selar", "Lança do Registro", "Arco de Página", "Arco Longo", "Besta de Registro", "Clava", "Shuriken"],
    "Catalisadores": ["Grimório Vazio", "Cajado de Carvalho", "Orbe de Cristal", "Relicário de Bronze", "Varinha", "Componentes Ritualísticos"],
    "Itens Comuns": ["Corda (15m)", "Tocha", "Lanterna", "Pedemeira", "Cantil", "Kit de Escalada", "Kit de Primeiros Socorros", "Saco de Dormir", "Mochila de Viagem", "Barraca Simples", "Kit de Reparos"],
    "Defesas": ["Marca de Uriel", "Túnica de Páginas", "Manto de Esquecimento", "Capa de Silêncio", "Defesa de Capítulos", "Traje de Arquivista", "Sobretudo do Guardião", "Terno de Registro"]
};