import fetch from 'node-fetch';
import type Logger from '../log';

export type Ok<T> = { ok: true; value: T };
export type Err<E> = { ok: false; value: E };
export type Result<T, E> = Ok<T> | Err<E>;

export interface PteroUser {
    id:         number;
    uuid:       string;
    identifier: string;
    externalId: string | undefined;
    username:   string;
    email:      string;
    firstname:  string;
    lastname:   string;
    language:   string;
    rootAdmin:  boolean;
    '2fa':      boolean;
    createdAt:  number;
    updatedAt:  number | undefined;
}

export interface CreateUserFields {
    username:   string;
    email:      string;
    password:   string;
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

export default class PanelManager {
    constructor(
        private log: Logger,
        public url: string,
        public key: string
    ) {}

    private debug(message: string): void {
        this.log.debug('http: '+ message);
    }

    private transform<T>(data: any): T {
        const parsed: Record<string, any> = {};
        for (let [k, v] of Object.entries(data)) parsed[camelCase(k)] = v;
        return parsed as T;
    }

    private async fetch<T, E = string>(
        method: string,
        path: string,
        data?: any
    ): Promise<Result<T, E>> {
        data &&= JSON.stringify(data);

        this.debug(`${method} ${this.url}/api/application/${path}`);
        const res = await fetch(`${this.url}/api/application/${path}`, {
            method,
            body: data,
            headers:{
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${this.key}`
            }
        });
        this.debug(`status: ${res.status}`);

        const body = await res.json().catch(()=>{});
        if (!res.ok) return {
            ok: false,
            value: body.errors[0].detail || body.errors[0].code
        };
        return { ok: true, value: body };
    }

    async fetchUser(email: string): Promise<PteroUser> {
        const data = await this.fetch<PteroUser>('GET', `users?filter[email]=${email}`);
        switch (data.ok) {
            case true: return this.transform<PteroUser>(data.value);
            case false: throw new Error(data.value);
        }
    }

    async createUser(options: CreateUserFields): Promise<PteroUser> {
        const user = await this.fetchUser(options.email).catch(()=>{});
        if (user) return user;

        const data = await this.fetch<PteroUser>('POST', 'users', {
            first_name: options.email.split('@')[0],
            last_name: options.email.split('@')[0],
            ...options
        });
        switch (data.ok) {
            case true: return this.transform<PteroUser>(data.value);
            case false: throw new Error(data.value);
        }
    }
}
