import { ActionArgs, json, LoaderArgs, MetaFunction } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { BsCheckCircle, BsFillKeyFill, BsTrashFill } from 'react-icons/bs';
import { checkbox, formData, text } from 'zod-form-data';
import FormBlock from '~/components/FormBlock';
import FormButton from '~/components/FormButton';
import FormCheckBox from '~/components/FormCheckBox';
import NavBar from '~/components/NavBar';
import SideBar from '~/components/SideBar';
import SideBarRow from '~/components/SideBarRow';
import { createKey, deleteKey, getUserKeys } from '~/models/apikey.server';
import { parseAPIPerms } from '~/models/permissions.server';
import { requireUser } from '~/session.server';

export const meta: MetaFunction = () => ({
  title: 'API • Account',
});

export async function action({ request }: ActionArgs) {
  const user = await requireUser(request);
  const data = await request.formData();
  if (request.method === 'DELETE') {
    const result = formData({ id: text() }).parse(data);
    try {
      void (await deleteKey(result.id));
      return json({ errors: null });
    } catch (err) {
      return json({ errors: (err as Error).message });
    }
  }

  const results = formData({
    serversCreate: checkbox(),
    serversUpdate: checkbox(),
    serversRenew: checkbox(),
    serversDelete: checkbox(),
  }).parse(data);

  let perms = parseAPIPerms(results);
  try {
    void (await createKey(user.id, perms));
    return json({ errors: null });
  } catch (err) {
    return json({ errors: (err as Error).message });
  }
}

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);
  const keys = await getUserKeys(user.id);

  return json({ keys });
}

export default function API() {
  const data = useActionData<typeof action>();
  const { keys } = useLoaderData<typeof loader>();

  return (
    <div>
      <NavBar account />
      <SideBar>
        <SideBarRow type="link" url="/account">
          Account
        </SideBarRow>
        <SideBarRow selected type="link" url="#">
          API Keys
        </SideBarRow>
      </SideBar>
      <div className="mt-6 ml-48 grid grid-cols-2 grid-rows-2">
        {data?.errors && (
          <div
            className="mt-4 flex max-w-lg items-center justify-center rounded-lg bg-red-100 p-2"
            role="alert"
          >
            <div className="flex justify-start text-base font-medium text-red-700">
              <BsCheckCircle className="h-6 w-6" />
              &nbsp;{data.errors}
            </div>
          </div>
        )}
        <div>
          <h1 className="ml-4 mb-3 mt-5 text-2xl font-medium text-white">
            API Keys
          </h1>
          <div className="flex max-w-md flex-col justify-center rounded-md bg-slate-800 p-2 shadow-lg">
            {keys?.length ? (
              <ol className="flex flex-col gap-y-2">
                {keys.map(k => (
                  <li key={k.id}>
                    <div
                      className="flex max-w-md flex-row justify-between rounded-md bg-slate-500 p-2 text-white shadow-lg"
                      onClick={() => navigator.clipboard.writeText(k.id)}
                    >
                      <BsFillKeyFill className="h-7 w-7" />
                      <code className="mt-0.5 font-mono font-bold">{k.id}</code>
                      <Form method="delete">
                        <button type="submit">
                          <input hidden id="id" name="id" defaultValue={k.id} />
                          <BsTrashFill className="mt-1 h-5 w-5 hover:text-red-400" />
                        </button>
                      </Form>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="p-1 text-lg text-white">
                You have no API keys.
              </div>
            )}
          </div>
        </div>
        <div>
          <h1 className="ml-4 mb-3 mt-5 text-2xl font-medium text-white">
            Create Key
          </h1>
          <FormBlock method="post">
            <p className="mb-2 text-sm text-white">
              Select the permissions below to give the API key.
            </p>
            <h3 className="mb-1 text-base font-medium text-white">Servers</h3>
            <FormCheckBox
              htmlFor="serversCreate"
              id="serversCreate"
              text="Create"
            />
            <FormCheckBox
              htmlFor="serversUpdate"
              id="serversUpdate"
              text="Update"
            />
            <FormCheckBox
              htmlFor="serversRenew"
              id="serversRenew"
              text="Renew"
            />
            <FormCheckBox
              htmlFor="serversDelete"
              id="serversDelete"
              text="Delete"
            />
            <div className="mt-4">
              <FormButton text="Create" type="submit" />
            </div>
          </FormBlock>
        </div>
      </div>
    </div>
  );
}
