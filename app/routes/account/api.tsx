import { json, LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import NavBar from '~/components/NavBar';
import SideBar from '~/components/SideBar';
import SideBarRow from '~/components/SideBarRow';
import { getUserKeys } from '~/models/apikey.server';
import { requireUser } from '~/session.server';

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
      <div className="mt-6 flex max-w-md flex-col justify-center rounded-md bg-slate-900 p-2 shadow-lg">
        {keys?.length ? (
          <ol className="gap-y-2">
            {keys.map(k => (
              <div>{k.id}</div>
            ))}
          </ol>
        ) : (
          <div className="p-1 text-lg text-white">You have no servers.</div>
        )}
      </div>
    </div>
  );
}
