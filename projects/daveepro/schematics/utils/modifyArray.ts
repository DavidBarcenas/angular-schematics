import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { Change } from '../interfaces/change.interface';
import { getSourceNodes } from './getNodes';
import { Context } from './createContext';
import * as ts from 'typescript';
import { InsertChange } from './changes';

export function modifyArray(
  context: Context,
  tree: Tree,
  propName: string,
  isObject: boolean,
  addChange: any
): Change {
  const fileText: Buffer | null = tree.read(context.path);

  if (!fileText) {
    throw new SchematicsException(`File does not exist [${context.path}]`);
  }

  const sourceText: string = fileText.toString('utf-8');
  const sourceFile = ts.createSourceFile(
    context.name,
    sourceText,
    ts.ScriptTarget.Latest,
    true
  );

  const nodes: ts.Node[] = getSourceNodes(sourceFile);

  const getSourceFileNodes = nodes.find(
    (n) => n.kind === ts.SyntaxKind.Identifier && n.getText() === propName
  );

  if (!getSourceFileNodes || !getSourceFileNodes.parent) {
    throw new SchematicsException(
      `The property you want to modify does not exist (${propName})`
    );
  }

  let nodeSiblings = getSourceFileNodes.parent.getChildren();
  let nodeIndex = nodeSiblings.indexOf(getSourceFileNodes);
  nodeSiblings = nodeSiblings.slice(nodeIndex);

  const literalExpressionNode = nodeSiblings.find(
    (n) =>
      n.kind ===
      (isObject
        ? ts.SyntaxKind.ObjectLiteralExpression
        : ts.SyntaxKind.ArrayLiteralExpression)
  );

  if (!literalExpressionNode) {
    throw new SchematicsException(
      `${propName} is not of type ${isObject ? 'object' : 'array'}`
    );
  }

  const listNode = literalExpressionNode
    .getChildren()
    .find((n) => n.kind === ts.SyntaxKind.SyntaxList);

  if (!listNode) {
    throw new SchematicsException('List node is not defined');
  }

  return new InsertChange(context.path, listNode.getEnd(), addChange);
}
