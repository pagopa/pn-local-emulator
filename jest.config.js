module.exports = {
  "roots": [
    "<rootDir>/src"
  ],
 "testMatch": [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)",
    "test"
  ],
  "moduleFileExtensions": ['ts', 'js'],
  "transform": {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  "modulePathIgnorePatterns": [
    "./__tests__/data.ts"
  ],
  "collectCoverageFrom": [
    "**/src/**/*.ts"
  ],
  "coveragePathIgnorePatterns": [
    "<rootDir>/src/generated/",
  ],
  "coverageThreshold": {
    "global": {
      "branches": 70,
      "lines": 70
    }
  }
}