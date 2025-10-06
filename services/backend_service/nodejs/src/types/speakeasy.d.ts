declare module 'speakeasy' {
  export const totp: {
    (options: {
      secret: string;
      encoding?: string;
    }): { base32: string; hex: string; };
    verify(options: {
      secret: string;
      encoding?: string;
      token: string;
    }): boolean;
  };
}