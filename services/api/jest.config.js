module.exports = {
  testEnvironment: "node",
  coverageDirectory: "coverage",
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/app.js",
    "!**/node_modules/**",
    "!**/vendor/**",
  ],
  coverageReporters: ["text", "lcov", "clover"],
  testMatch: ["**/tests/**/*.test.js"],
};
