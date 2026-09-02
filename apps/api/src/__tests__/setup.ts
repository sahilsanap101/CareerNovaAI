import 'dotenv/config';

// Set test environment variables
process.env['NODE_ENV'] = 'test';
process.env['DATABASE_URL'] = process.env['DATABASE_URL'] ?? 'postgresql://pathforge_user:pathforge_pass@localhost:5432/pathforge_test';
process.env['DIRECT_URL'] = process.env['DIRECT_URL'] ?? 'postgresql://pathforge_user:pathforge_pass@localhost:5432/pathforge_test';
process.env['JWT_SECRET'] = 'test-jwt-secret-that-is-at-least-32-characters-long';
process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-that-is-at-least-32-characters-long';
process.env['JWT_EXPIRES_IN'] = '15m';
process.env['REFRESH_EXPIRES_IN'] = '7d';
process.env['FRONTEND_URL'] = 'http://localhost:5173';
process.env['LOG_LEVEL'] = 'error';
