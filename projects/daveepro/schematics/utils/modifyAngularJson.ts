import { Tree } from '@angular-devkit/schematics';

export function modifyAngularJson(tree: Tree, projectName: string) {
  const fileName = 'angular.json';
  const file = tree.read(fileName);

  if (!file) {
    throw new Error(`File not found: angular.json`);
  }

  const angularJson = JSON.parse(file.toString());
  const appOutputPath = angularJson.projects[projectName].architect.build;

  appOutputPath.options.styles.push(
    'node_modules/font-aweosme/font-awesome.css'
  );
  angularJson.projects[projectName].architect.build = appOutputPath;

  tree.overwrite(fileName, JSON.stringify(angularJson, null, 2));
}
