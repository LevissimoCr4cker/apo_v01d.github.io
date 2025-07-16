// tokenizer.js
// Simples tokenizer de palavras baseado em dicionário

const vocab = new Map();        // Mapa palavra → ID
const reverseVocab = [];        // Lista ID → palavra
let nextId = 1;

/**
 * Codifica uma string em tokens numéricos
 * @param {string} text - Frase do usuário
 * @returns {number[]} tokens
 */
export function encode(text) {
  const words = text.toLowerCase().trim().split(/\s+/);
  const tokens = [];

  for (let word of words) {
    if (!vocab.has(word)) {
      vocab.set(word, nextId);
      reverseVocab[nextId] = word;
      nextId++;
    }
    tokens.push(vocab.get(word));
  }

  return tokens;
}

/**
 * Decodifica tokens numéricos de volta para string
 * @param {number[]} tokens
 * @returns {string}
 */
export function decode(tokens) {
  return tokens.map(id => reverseVocab[id] || '[UNK]').join(' ');
}
