export class Context {
  path: string;
  name: string;
}

export function createContext(
  sourceRoot: string,
  fileName: string,
  filePath: string
) {
  const path = sourceRoot + filePath;
  const name = fileName;

  return {
    path,
    name,
  };
}
