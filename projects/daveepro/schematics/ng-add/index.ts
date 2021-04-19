import { Rule, Tree, SchematicContext } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { InsertChange } from '../utils/changes';
import { createContext } from '../utils/createContext';
import { getHost } from '../utils/host';
import { modifyArray } from '../utils/modifyArray';
import { updateAngularJson } from './updateAngularJson';

export function ngAdd(options: any): Rule {
  return async (tree: Tree, context: SchematicContext) => {
    const host = await getHost(tree, options);
    context.addTask(new NodePackageInstallTask());

    updateAngularJson(tree, host.name);

    const appModuleContext = createContext(
      host.sourceRoot,
      host.name,
      '/app.module.ts'
    );

    const change = modifyArray(appModuleContext, tree, 'declarations');
    const declarationRecorder = tree.beginUpdate(appModuleContext.path);

    if (change instanceof InsertChange) {
      declarationRecorder.insertLeft(change.pos, change.toAdd);
    }

    return tree.commitUpdate(declarationRecorder);
  };
}
