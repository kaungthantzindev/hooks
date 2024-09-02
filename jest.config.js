module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom'], // Ensure this is correct based on previous steps
  moduleNameMapper: {
    // Map your module aliases if necessary
  },
  transform: {
    "^.+\\.(ts|tsx)$": ['ts-jest', {
        tsconfig: 'tsconfig.json', // Path to your tsconfig file
        // You can include other ts-jest specific options here as needed
    }]
  }
};
