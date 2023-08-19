const config = {
  plugins: [
    require.resolve("@trivago/prettier-plugin-sort-imports"),
    require.resolve("prettier-plugin-tailwindcss"),
  ],
  importOrder: [
    "^react",
    "<THIRD_PARTY_MODULES>",
    "^@\\w+/\\w+",
    "^@/\\w",
    "^./",
  ],
  importOrderSeparation: true,
  singleQuote: false,
};

module.exports = config;
