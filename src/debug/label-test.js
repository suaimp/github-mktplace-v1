// Quick test to verify the label matching logic
const fieldLabel = 'Artigo é patrocinado';
const labelLower = fieldLabel.toLowerCase();

console.log('Original label:', fieldLabel);
console.log('Lower case:', labelLower);
console.log('Includes "patrocinado":', labelLower.includes('patrocinado'));
console.log('Characters:', [...labelLower]);

// Test the exact detection logic
const value = 'Sim';
const fieldType = 'radio';

const includesPatrocinado = labelLower.includes('patrocinado');
const isString = typeof value === 'string';
const isSimOrNao = (value === 'Sim' || value === 'Não');

console.log('\nDetection results:');
console.log('- includesPatrocinado:', includesPatrocinado);
console.log('- isString:', isString);
console.log('- isSimOrNao:', isSimOrNao);
console.log('- ALL CONDITIONS MET:', includesPatrocinado && isString && isSimOrNao);
