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
    "<rootDir>/src/__tests__/data.ts",
  ],
  "coveragePathIgnorePatterns": [
    "<rootDir>/src/generated/",
  ],
  "testPathIgnorePatterns": [
      "<rootDir>/src/domain/__tests__"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 70,
      "lines": 70
    }
  }
}
