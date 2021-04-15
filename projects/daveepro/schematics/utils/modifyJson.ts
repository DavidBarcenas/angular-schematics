import { Tree } from '@angular-devkit/schematics';

function modifyAngularJson(tree: Tree) {
  const file = tree.read('angular.json');
  if (!file) {
    throw new Error(`File not found: angular.json`);
  }
  const angularJson = JSON.parse(file.toString());
  const appOutputPath = angularJson.projects['internet'].architect.build;
  appOutputPath.options.styles.push('font-aweosme.css');
  angularJson.projects['internet'].architect.build = appOutputPath;
  tree.overwrite('angular.json', JSON.stringify(angularJson, null, 3));
}
