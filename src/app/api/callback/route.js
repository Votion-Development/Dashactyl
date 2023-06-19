import { NextResponse } from 'next/server';
import * as db from '../../../lib/database';

export async function GET(request) {
    console.log()
    return NextResponse.json({ "data": "hello" });
}