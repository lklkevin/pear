import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  testEnvironment: "jsdom",
  coverageProvider: "v8",

  // Include JS/TS test file extensions
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],

  // Match both .test.js(x) and .test.ts(x)
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],

  // Optional: setup test env if needed
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};

export default createJestConfig(config);
