// Script de test de connexion MySQL pour Hostinger
require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('🔍 Test de connexion MySQL Hostinger...\n');
  console.log('Configuration:');
  console.log(`  Hôte     : ${process.env.DB_HOST}`);
  console.log(`  Port     : ${process.env.DB_PORT}`);
  console.log(`  Database : ${process.env.DB_NAME}`);
  console.log(`  User     : ${process.env.DB_USER}`);
  console.log(`  Driver   : ${process.env.DB_DRIVER}\n`);

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    console.log('✅ Connexion MySQL réussie !');
    
    // Test : Lister les tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`\n📊 Tables disponibles (${tables.length}) :`);
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });
    
    // Test : Compter les employés
    const [employees] = await connection.execute('SELECT COUNT(*) as count FROM employees');
    console.log(`\n👥 Nombre d'employés : ${employees[0].count}`);
    
    // Test : Compter les utilisateurs RH
    const [hrUsers] = await connection.execute('SELECT COUNT(*) as count FROM hr_users');
    console.log(`👔 Nombre d'utilisateurs RH : ${hrUsers[0].count}`);
    
    // Test : Lister les premiers employés
    const [empList] = await connection.execute('SELECT name, email, position, department FROM employees LIMIT 3');
    if (empList.length > 0) {
      console.log('\n📋 Employés enregistrés :');
      empList.forEach(emp => {
        console.log(`  - ${emp.name} (${emp.position}) - ${emp.email}`);
      });
    }
    
    await connection.end();
    console.log('\n✅ Test terminé avec succès !');
    
  } catch (error) {
    console.error('\n❌ Erreur de connexion MySQL :');
    console.error(`  Code    : ${error.code || 'N/A'}`);
    console.error(`  Message : ${error.message}`);
    console.error(`  Errno   : ${error.errno || 'N/A'}`);
    
    console.log('\n💡 Suggestions :');
    console.log('  1. Vérifiez que les identifiants dans .env sont corrects');
    console.log('  2. Vérifiez que la base de données existe dans phpMyAdmin');
    console.log('  3. Exécutez le script SQL hostinger_database.sql dans phpMyAdmin');
    console.log('  4. Vérifiez que l\'hôte est "localhost" pour Hostinger');
    console.log('  5. Assurez-vous que mysql2 est installé : npm install mysql2');
    
    process.exit(1);
  }
}

testConnection();
