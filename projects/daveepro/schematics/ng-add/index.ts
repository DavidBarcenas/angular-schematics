import { Rule, Tree, SchematicContext } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { modifyAngularJson } from '../utils/modifyAngularJson';

export function ngAdd(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    context.addTask(new NodePackageInstallTask());
    modifyAngularJson(tree, 'internet');
    return tree;
  };
}
