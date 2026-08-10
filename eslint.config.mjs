import next from 'eslint-config-next';

/**
 * eslint-config-next v16 ships a native flat-config array, so no FlatCompat
 * shim is needed (and using one throws on this version).
 */
export default [
  ...next,
  {
    ignores: ['.velite/**', '.next/**', 'public/static/**', 'src/data/**'],
  },
];
