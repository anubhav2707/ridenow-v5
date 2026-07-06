import base from "@ridenow/config/eslint-base";

export default [
  ...base,
  {
    rules: {
      // NestJS relies heavily on decorators + DI; the decorator itself is the
      // "use" of many parameter properties.
      "@typescript-eslint/no-extraneous-class": "off",
    },
  },
];
