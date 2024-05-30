import { execSync } from 'child_process';

const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Please provide a migration name.');
  process.exit(1);
}

try {
  execSync(`yarn typeorm migration:create ./db/migrations/${migrationName}`);
  console.info(`Migration ${migrationName} created successfully.`);
} catch (error) {
  console.error(`Error creating migration: ${error}`);
  process.exit(1);
}
