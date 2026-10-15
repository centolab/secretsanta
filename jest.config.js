/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '\\.css$': '<rootDir>/test/style-mock.js',
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['/node_modules/', '/supabase/'],
};
