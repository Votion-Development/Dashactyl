import { Axios } from 'axios';
import { getPanelSettings } from './settings.server';

interface FractalItem<T> {
  attributes: T;
}

interface FractalList<T> {
  data: FractalItem<T>[];
}

export interface RemoteServer {
  id: number;
  uuid: string;
  identifier: string;
  name: string;
  description: string;
  status: string | null;
  node: number;
  suspended: boolean;
}

export interface RemoteUser {
  id: number;
  uuid: string;
  identifier: string;
  externalId: string | null;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  relationships?: {
    servers: FractalList<RemoteServer>;
  };
}

let axios: Axios | undefined;

if (!axios) {
  getPanelSettings()
    .then(([u, k]) => {
      axios = new Axios({
        baseURL: u,
        headers: {
          'User-Agent': 'Dashactyl v3.0.0',
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${k}`,
        },
      });
    })
    .catch(() => {});
}

function camelCase(str: string): string {
  let res = '';
  let next = false;

  str.split('').forEach(c => {
    if (next) {
      next = false;
      res += c.toUpperCase();
    } else if (c === '_') {
      next = true;
    } else {
      res += c;
    }
  });

  return res;
}

function toCamelCase<T>(obj: any): T {
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(i => toCamelCase(i)) as T;
  const parsed = {} as any;

  for (let [k, v] of Object.entries(obj)) {
    parsed[camelCase(k)] = v;
  }

  return parsed;
}

export async function getRemoteUser(id: string): Promise<RemoteUser | null> {
  if (!axios) return null;

  try {
    const res = await axios.get(`/api/application/users/external/${id}`);
    return toCamelCase<FractalItem<RemoteUser>>(JSON.parse(res.data))
      .attributes;
  } catch (err) {
    return null;
  }
}

export async function getRemoteUserByEmail(
  email: string
): Promise<RemoteUser | null> {
  if (!axios) return null;

  try {
    const res = await axios.get(
      `/api/application/users?filter[email]=${email}`
    );
    return (
      toCamelCase<FractalList<RemoteUser>>(JSON.parse(res.data)).data[0]
        ?.attributes || null
    );
  } catch {
    return null;
  }
}

export async function updateRemoteUser(
  data: RemoteUser
): Promise<RemoteUser | null> {
  if (!axios) return null;

  try {
    const res = await axios.post(
      `/api/application/users/${data.id}`,
      JSON.stringify(data)
    );
    return toCamelCase<FractalItem<RemoteUser>>(JSON.parse(res.data))
      .attributes;
  } catch {
    return null;
  }
}

// TODO: return a proper Response object with context for frontend
export async function getRemoteServers(
  id: string
): Promise<RemoteServer[] | null> {
  if (!axios) return null;

  try {
    let user = await getRemoteUser(id);
    if (!user) return null;
    let res = await axios!.get(
      `/api/application/users/${user.id}?include=servers`
    );
    return toCamelCase<FractalItem<RemoteUser>>(
      JSON.parse(res.data)
    ).attributes.relationships!.servers.data.map(s => s.attributes);
  } catch {
    return null;
  }
}
