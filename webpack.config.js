const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

// eslint-disable-next-line func-names
module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  config.resolve = {
    ...config.resolve,
    alias: {
      ...config.resolve.alias,
      react: path.resolve(__dirname, './node_modules/react'),
    },
  };

  return config;
};
