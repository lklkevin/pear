module.exports = {
    preset: "ts-jest",
    testEnvironment: "jest-environment-jsdom",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    transform: {
      "^.+\\.(ts|tsx)$": "ts-jest",
    },
    testMatch: ["**/__tests__/**/*.[jt]s?(x)"],
    setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],
    moduleNameMapper: {
      "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    },
  };
  