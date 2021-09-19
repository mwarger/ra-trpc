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
import { createTRPCDataProvider } from 'ra-trpc/client';
import superjson from 'superjson';
import { createTRPCClient } from '@trpc/client';
import { AppRouter } from '../server/routers/app';

const ReactAdmin = () => {
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      url: `http://localhost:3000/api/trpc`,
      transformer: superjson,
    }),
  );

  const resources = {
    post: ['title', 'description'],
  };

  const trpcDataProvider = createTRPCDataProvider(trpcClient, resources);

  return (
    <Admin dataProvider={trpcDataProvider}>
      <Resource
        name="post"
        list={ListGuesser}
        show={ShowGuesser}
        edit={EditGuesser}
        // create={WorkoutCreate}
      />
    </Admin>
  );
};

export default ReactAdmin;

const WorkoutCreate = (props: any) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="title" />
      <TextInput source="description" />
    </SimpleForm>
  </Create>
);
