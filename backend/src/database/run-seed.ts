import { DataSource } from 'typeorm';
import { AppDataSource } from './data-source';
import { seedDatabase } from './seed';

async function runSeed() {
  let dataSource: DataSource;
  
  try {
    // Create a new DataSource with synchronize enabled for seeding
    dataSource = new DataSource({
      ...AppDataSource.options,
      synchronize: true, // Enable sync to create tables
    });
    
    await dataSource.initialize();
    console.log('Database connected');
    
    // Sync database schema (create tables if they don't exist)
    console.log('Synchronizing database schema...');
    await dataSource.synchronize();
    console.log('Database schema synchronized');
    
    await seedDatabase(dataSource);
    
    await dataSource.destroy();
    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

runSeed();

