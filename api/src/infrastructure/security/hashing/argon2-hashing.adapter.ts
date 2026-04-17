import { Injectable } from '@nestjs/common';
import { hash, verify } from 'argon2';
import { IHashingAdapter } from '@/core/domain/interfaces/hashing.interface';

@Injectable()
export class Argon2HashingAdapter implements IHashingAdapter {
  async hash(plain: string): Promise<string> {
    return hash(plain);
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return verify(hashed, plain);
  }
}
