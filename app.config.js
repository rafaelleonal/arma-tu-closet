// app.json holds the store configuration. EAS development and preview builds set APP_VARIANT so
// they install next to the store app with their own identifier and name.
const VARIANTS = {
  development: { suffix: 'dev', label: 'dev' },
  preview: { suffix: 'preview', label: 'prueba' },
};

module.exports = ({ config }) => {
  const variant = VARIANTS[process.env.APP_VARIANT];
  if (!variant) return config;
  return {
    ...config,
    name: `${config.name} (${variant.label})`,
    ios: {
      ...config.ios,
      bundleIdentifier: `${config.ios.bundleIdentifier}.${variant.suffix}`,
    },
    android: {
      ...config.android,
      package: `${config.android.package}.${variant.suffix}`,
    },
  };
};
