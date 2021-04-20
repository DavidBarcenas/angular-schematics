import { Tree, UpdateRecorder } from '@angular-devkit/schematics';
import { InsertChange } from '../my-service';
import { createContext } from '../utils/createContext';
import { modifyArray } from '../utils/modifyArray';

export function updateAppModule(
  projectName: string,
  projectSourceRoot: string,
  tree: Tree
): UpdateRecorder {
  const context = createContext(
    projectSourceRoot,
    projectName,
    '/app.module.ts'
  );
  const change = modifyArray(context, tree, 'declarations', false);
  const declarationRecorder = tree.beginUpdate(context.path);

  if (change instanceof InsertChange) {
    declarationRecorder.insertLeft(change.pos, change.toAdd);
  }

  console.log('tree 2', tree);
  return declarationRecorder;
}
