import { Rule, Tree } from '@angular-devkit/schematics';
import { createContext } from '../utils/createContext';
import { modifyArray } from '../utils/modifyArray';

export function updateAppModule(options: any, project: any): Rule {
  return (tree: Tree) => {
    const context = createContext(
      project.sourceRoot,
      options.name,
      '/app.module.ts'
    );
    const change = modifyArray(context, tree, 'declarations');
  };
}
