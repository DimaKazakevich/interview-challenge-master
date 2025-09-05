declare class LeaderLine {
  constructor(
    start: Element,
    end: Element,
    options?: {
      color?: string;
      size?: number;
      path?: string;
      [key: string]: unknown;
    }
  );
  remove(): void;
}

declare var LeaderLine: {
  new (
    start: Element,
    end: Element,
    options?: {
      color?: string;
      size?: number;
      path?: string;
      [key: string]: unknown;
    }
  ): LeaderLine;
};

export {};
