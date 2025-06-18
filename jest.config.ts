const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;
import type {Config} from 'jest';

const config: Config = {
  testEnvironment: "jsdom",
  verbose: true,
  collectCoverageFrom: [
    "tests/**/*.(js|ts)?(x)"
  ],
  testMatch: [
    "**/?(*.)(spec|test).(js|ts)?(x)"
  ],
  transform: {
    ...tsJestTransformCfg,
  },
};

export default config;
