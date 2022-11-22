import { hashPassword, IApiSchema } from '@foal/core';
import { User } from '../app/entities';
import { dataSource } from '../db';

export const schema: IApiSchema = {
  additionalProperties: false,
  properties: {
    username: { type: 'string' },
    email: { type: 'string' },
    password: { type: 'string' }
  },
  required: ['username', 'email', 'password'],
  type: 'object',
};

interface UserFields {
  username: string;
  email: string;
  password: string;
}

export async function main(data: UserFields) {
  await dataSource.initialize();

  try {
    const user = new User();
    user.username = data.username;
    user.email = data.email;
    user.password = await hashPassword(data.password);

    console.log(await user.save());
  } catch (error: any) {
    console.error(error.message);
  } finally {
    await dataSource.destroy();
  }
}
