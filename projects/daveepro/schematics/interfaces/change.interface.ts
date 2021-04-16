export interface Host {
  write(path: string, content: string): Promise<void>;
  read(path: string): Promise<string>;
}

export interface Change {
  apply(host: Host): Promise<void>;

  /**
   * The file this change should be applied to.
   * Some changes might not apply to a file (maybe the config).
   */
  readonly path: string | null;

  /**
   * The order this change should be applied. Normally the position inside the file.
   * Changes are applied from the bottom of a file to the top.
   */
  readonly order: number;

  /**
   * The description of this change.
   * This will be outputted in a dry or verbose run.
   */
  readonly description: string;
}
