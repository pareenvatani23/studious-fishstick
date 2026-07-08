// Metro config. Only customization: stub the optional `@opentelemetry/api`
// dependency that @supabase/supabase-js references but that we don't use. Native
// bundling already skips it; the web bundle (used for e2e tests) is stricter, so
// we resolve it to an empty module. No effect on the shipped Android bundle.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const EMPTY = path.resolve(__dirname, 'src/shims/empty.js');
const origResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@opentelemetry/api') {
    return { type: 'sourceFile', filePath: EMPTY };
  }
  if (origResolveRequest) return origResolveRequest(context, moduleName, platform);
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
