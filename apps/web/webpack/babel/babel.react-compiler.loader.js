import { transformSync } from '@babel/core';
import BabelPluginReactCompiler from 'babel-plugin-react-compiler';
import BabelPresetEnv from '@babel/preset-env';
import BabelPresetReact from '@babel/preset-react';
import BabelPresetTs from '@babel/preset-typescript';
import reactCompilerConfig from './babel.react-compiler.config.js';

function reactCompilerLoader(sourceCode, sourceMap) {
  const result = transformSync(sourceCode, {
    filename: this.resourcePath, // Absolute path to file
    presets: [BabelPresetEnv, BabelPresetReact, BabelPresetTs],
    plugins: [[BabelPluginReactCompiler, reactCompilerConfig]]
  });

  if (result === null) {
    this.callback(Error(`Failed to transform "${this.resourcePath}"`));
    return;
  }

  this.callback(
    null,
    result.code,
    result.map === null ? undefined : result.map
  );
}

export default reactCompilerLoader;
