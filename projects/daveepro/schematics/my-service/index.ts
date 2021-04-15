import {
  Rule,
  Tree,
  SchematicsException,
  apply,
  url,
  applyTemplates,
  move,
  chain,
  mergeWith,
} from '@angular-devkit/schematics';

import {
  strings,
  normalize,
  virtualFs,
  workspaces,
} from '@angular-devkit/core';

import { Schema as MyServiceSchema } from './schema';

import * as ts from 'typescript';

export interface Host {
  write(path: string, content: string): Promise<void>;
  read(path: string): Promise<string>;
}

export interface Change {
  apply(host: Host): Promise<void>;

  // The file this change should be applied to. Some changes might not apply to
  // a file (maybe the config).
  readonly path: string | null;

  // The order this change should be applied. Normally the position inside the file.
  // Changes are applied from the bottom of a file to the top.
  readonly order: number;

  // The description of this change. This will be outputted in a dry or verbose run.
  readonly description: string;
}

class AddObjectToPeopleArrayContext {
  path: string; // path of the file where the people array exist
  name: string;
  storeModulePath: string;
}

export class InsertChange implements Change {
  order: number;
  description: string;

  constructor(public path: string, public pos: number, public toAdd: string) {
    if (pos < 0) {
      throw new Error('Negative positions are invalid');
    }
    this.description = `Inserted ${toAdd} into position ${pos} of ${path}`;
    this.order = pos;
  }

  /**
   * This method does not insert spaces if there is none in the original string.
   */
  apply(host: Host) {
    return host.read(this.path).then((content) => {
      const prefix = content.substring(0, this.pos);
      const suffix = content.substring(this.pos);

      return host.write(this.path, `${prefix}${this.toAdd}${suffix}`);
    });
  }
}

function createHost(tree: Tree): workspaces.WorkspaceHost {
  return {
    async readFile(path: string): Promise<string> {
      const data = tree.read(path);
      if (!data) {
        throw new SchematicsException('File not found.');
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

// file update

export function createAddObjectToPeopleArrayContext(
  options: any,
  project: any,
  projectType: any
) {
  let path = `${project.sourceRoot}/${projectType}/app.routing.module.ts`;
  let name = options.name;
  let storeModulePath = options.storeModulePath;

  return {
    path,
    name,
    storeModulePath,
  };
}

export function getSourceNodes(sourceFile: ts.SourceFile): ts.Node[] {
  const nodes: ts.Node[] = [sourceFile];
  const result = [];

  while (nodes.length > 0) {
    const node = nodes.shift();

    if (node) {
      result.push(node);
      if (node.getChildCount(sourceFile) >= 0) {
        nodes.unshift(...node.getChildren());
      }
    }
  }

  return result;
}

export function addObjectToArrayChange(
  context: AddObjectToPeopleArrayContext,
  tree: Tree
): Change {
  let text = tree.read(context.path); // reads the file from the tree
  if (!text) throw new SchematicsException(`File does not exist.`); // throw an error if the file doesn't exist
  let sourceText = text.toString('utf-8');

  // create the typescript source file
  let sourceFile = ts.createSourceFile(
    'pruebaRoutes',
    sourceText,
    ts.ScriptTarget.Latest,
    true
  );

  // get the nodes of the source file
  let nodes: ts.Node[] = getSourceNodes(sourceFile);

  const peopleNode = nodes.find(
    (n) => n.kind === ts.SyntaxKind.Identifier && n.getText() === 'routes'
  );

  if (!peopleNode || !peopleNode.parent) {
    throw new SchematicsException(
      `expected people variable in ${context.path}`
    );
  }

  let peopleNodeSiblings = peopleNode.parent.getChildren();
  let peopleNodeIndex = peopleNodeSiblings.indexOf(peopleNode);
  peopleNodeSiblings = peopleNodeSiblings.slice(peopleNodeIndex);

  let peopleArrayLiteralExpressionNode = peopleNodeSiblings.find(
    (n) => n.kind === ts.SyntaxKind.ArrayLiteralExpression
  );

  if (!peopleArrayLiteralExpressionNode) {
    throw new SchematicsException(
      `people ArrayLiteralExpression node is not defined`
    );
  }

  let peopleListNode = peopleArrayLiteralExpressionNode
    .getChildren()
    .find((n) => n.kind === ts.SyntaxKind.SyntaxList);

  if (!peopleListNode) {
    throw new SchematicsException(`people list node is not defined`);
  }

  let personToAdd = `,
{
  path: 'hola'
  component:  Prueba.component
}`;

  return new InsertChange(context.path, peopleListNode.getEnd(), personToAdd);
}

export function addObjectToPeopleArrayRule(
  options: any,
  project: any,
  projectType: any
): Rule {
  return (tree: Tree) => {
    let context = createAddObjectToPeopleArrayContext(
      options,
      project,
      projectType
    );
    let change = addObjectToArrayChange(context, tree);

    const declarationRecorder = tree.beginUpdate(context.path);
    if (change instanceof InsertChange) {
      declarationRecorder.insertLeft(change.pos, change.toAdd);
    }
    tree.commitUpdate(declarationRecorder); // commits the update on the tree

    return tree;
  };
}

// file update

export function myService(options: MyServiceSchema): Rule {
  return async (tree: Tree) => {
    const host = createHost(tree);
    const { workspace } = await workspaces.readWorkspace('/', host);

    if (!options.project) {
      options.project = workspace.extensions.defaultProject
        ? workspace.extensions.defaultProject.toString()
        : '';
    }

    const project = workspace.projects.get(options.project);
    if (!project) {
      throw new SchematicsException(`Invalid project name: ${options.project}`);
    }

    const projectType =
      project.extensions.projectType === 'application' ? 'app' : 'lib';

    if (options.path === undefined) {
      options.path = `${project.sourceRoot}/${projectType}`;
    } else {
      options.path = `${project.sourceRoot}/${projectType}/${options.path}`;
    }

    // const envs = tree.read(
    //   `${project.sourceRoot}/${projectType}/app.routing.module.ts`
    // );
    // if(envs) {
    //   const content = envs?.toString('utf-8');
    //   const json = JSON.parse(content);
    //   console.log('***EL BUFFER***', content);

    // }

    const templateSource = apply(url('./files/prueba'), [
      applyTemplates({
        classify: strings.classify,
        dasherize: strings.dasherize,
        name: options.name,
      }),
      move(normalize(options.path as string)),
    ]);

    return chain([
      addObjectToPeopleArrayRule(options, project, projectType),
      mergeWith(templateSource),
    ]);
  };
}
