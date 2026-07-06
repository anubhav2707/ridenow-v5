import config from "@ridenow/config/eslint";

export default [
  ...config,
  {
    // NestJS relies on emitted decorator metadata, so injected class types must
    // be VALUE imports — disable the type-import rule that would erase them.
    rules: {
      "@typescript-eslint/consistent-type-imports": "off",
    },
  },
];
