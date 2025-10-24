// Quick test to check if server starts
console.log('Testing server startup...');

try {
  require('./index.js');
  console.log('Server file loaded successfully');
} catch (error) {
  console.error('Error loading server:', error.message);
  console.error(error.stack);
}
