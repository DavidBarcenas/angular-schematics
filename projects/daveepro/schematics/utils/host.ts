import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { virtualFs, workspaces } from '@angular-devkit/core';

export function createHost(tree: Tree): workspaces.WorkspaceHost {
  return {
    async readFile(path: string): Promise<string> {
      const data = tree.read(path);

      if (!data) {
        throw new SchematicsException(`File not found [${path}]`);
      }

      return virtualFs.fileBufferToString(data);
    },

    async writeFile(path: string, data: string): Promise<void> {
      return tree.overwrite(path, data);
    },

    async isDirectory(path: string): Promise<boolean> {
      return !tree.exists(path) && tree.getDir(path).subfiles.length > 0;
    },

    async isFile(path: string): Promise<boolean> {
      return tree.exists(path);
    },
  };
}

export async function getHost(tree: Tree, options: any): Promise<any> {
  const host = createHost(tree);
  const { workspace } = await workspaces.readWorkspace('/', host);
  const defaultProject = workspace.extensions.defaultProject || '';

  if (!options.project) {
    options.project = defaultProject.toString();
  }

  const project = workspace.projects.get(options.project);

  if (!project) {
    throw new SchematicsException(`Invalid project name: ${options.project}`);
  }

  const projectType =
    project.extensions.projectType === 'application' ? 'app' : 'lib';

  if (!options.path) {
    options.path = `${project.sourceRoot}/${projectType}`;
  }

  return {
    name: options.project,
    sourceRoot: options.path,
  };
}
