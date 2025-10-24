// Quick script to clear localStorage orders
// Run this in browser console if needed: localStorage.removeItem('fc_orders')

console.log('🧹 Clearing localStorage orders...');
localStorage.removeItem('fc_orders');
console.log('✅ Orders cleared from localStorage!');
console.log('📊 Remaining localStorage items:', Object.keys(localStorage));
