import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { Change } from '../interfaces/change.interface';
import { getSourceNodes } from './getNodes';
import { Context } from './createContext';
import * as ts from 'typescript';

export function modifyArray(
  context: Context,
  tree: Tree,
  propName: string
): Change {
  const fileText: Buffer = tree.read(context.path);

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

  const arrayLiteralExpressionNode = nodeSiblings.find(
    (n) => n.kind === ts.SyntaxKind.ArrayLiteralExpression
  );

  if (!arrayLiteralExpressionNode) {
    throw new SchematicsException(`${propName} is not of type array`);
  }

  const listNode = arrayLiteralExpressionNode
    .getChildren()
    .find((n) => n.kind === ts.SyntaxKind.SyntaxList);

  if (!listNode) {
    throw new SchematicsException();
  }

  console.log('listnodes', listNode);
}
