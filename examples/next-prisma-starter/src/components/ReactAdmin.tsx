import React, { useState } from 'react';
import {
  Admin,
  ListGuesser,
  Resource,
  ShowGuesser,
  EditGuesser,
  Create,
  SimpleForm,
  TextInput,
} from 'react-admin';
import { createTRPCDataProvider, Resources } from 'ra-trpc/client';
import superjson from 'superjson';
import { createTRPCClient } from '@trpc/client';
import { AppRouter } from '../server/routers/app';
import type { Post, User } from '.prisma/client';

const ReactAdmin = () => {
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      url: `http://localhost:3000/api/trpc`,
      transformer: superjson,
    }),
  );

  const resources: Resources<{ post: Post; user: User }> = {
    post: { fields: ['id', 'title', 'text'] },
    user: {
      fields: ['id', 'name'],
    },
  };

  const trpcDataProvider = createTRPCDataProvider(trpcClient, resources);

  return (
    <Admin dataProvider={trpcDataProvider}>
      <Resource
        name="post"
        list={ListGuesser}
        show={ShowGuesser}
        edit={EditGuesser}
        create={PostCreate}
      />
      <Resource
        name="user"
        list={ListGuesser}
        show={ShowGuesser}
        edit={EditGuesser}
      />
    </Admin>
  );
};

export default ReactAdmin;

const PostCreate = (props: any) => {
  return (
    <Create {...props}>
      <SimpleForm>
        <TextInput source="title" />
        <TextInput source="text" />
      </SimpleForm>
    </Create>
  );
};
