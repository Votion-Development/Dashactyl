import { ActionArgs, json, LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import FormBlock from '~/components/FormBlock';
import FormButton from '~/components/FormButton';
import FormCheckBox from '~/components/FormCheckBox';
import NavBar from '~/components/NavBar';
import SideBar from '~/components/SideBar';
import SideBarRow from '~/components/SideBarRow';
import { getUserKeys } from '~/models/apikey.server';
import { requireUser } from '~/session.server';

export async function action({ request }: ActionArgs) {
  const user = await requireUser(request);
  const data = await request.formData();
}

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);
  const keys = await getUserKeys(user.id);

  return json({ keys });
}

export default function API() {
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
        <div>
          <h1 className="ml-4 mb-3 mt-5 text-2xl font-medium text-white">
            API Keys
          </h1>
          <div className="flex max-w-md flex-col justify-center rounded-md bg-slate-800 p-2 shadow-lg">
            {keys?.length ? (
              <ol className="gap-y-2">
                {keys.map(k => (
                  <div>{k.id}</div>
                ))}
              </ol>
            ) : (
              <div className="p-1 text-lg text-white">You have no API keys.</div>
            )}
          </div>
        </div>
        <div>
          <h1 className="ml-4 mb-3 mt-5 text-2xl font-medium text-white">
            Create Key
          </h1>
          <FormBlock method="post">
            <p className="text-white text-sm mb-2">Select the permissions below to give the API key.</p>
            <h3 className="text-white text-base font-medium mb-1">Servers</h3>
            <FormCheckBox htmlFor="servers_create" id="servers_create" text="Create" />
            <FormCheckBox htmlFor="servers_update" id="servers_update" text="Update" />
            <FormCheckBox htmlFor="servers_renew" id="servers_renew" text="Renew" />
            <FormCheckBox htmlFor="servers_delete" id="servers_delete" text="Delete" />
            <div className="mt-4"><FormButton text="Create" type="submit" /></div>
          </FormBlock>
        </div>
      </div>
    </div>
  );
}
