import base from "@ridenow/config/eslint";

export default [
  ...base,
  {
    // NestJS relies on parameter decorators and class-based DI.
    files: ["**/*.ts"],
    rules: {
      "@typescript-eslint/no-extraneous-class": "off",
    },
  },
];
