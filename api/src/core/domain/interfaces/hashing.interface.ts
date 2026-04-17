export const HASHING_ADAPTER = Symbol('IHashingAdapter');

export interface IHashingAdapter {
  hash(plain: string): Promise<string>;
  compare(plain: string, hashed: string): Promise<boolean>;
}
