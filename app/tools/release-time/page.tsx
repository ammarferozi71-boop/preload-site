import type { Metadata } from 'next';
import ReleaseTime from './ReleaseTime';
import { SITE_URL_RESOLVED } from '@/lib/site';
export const metadata:Metadata={title:'Release time converter',description:'Convert a confirmed game launch timestamp into your timezone.',alternates:{canonical:`${SITE_URL_RESOLVED}/tools/release-time`}};
export default function Page(){return <main className="mx-auto max-w-3xl space-y-6 px-4 py-12"><p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Preload tools</p><h1 className="text-4xl font-bold">Your launch time, locally</h1><ReleaseTime/></main>;}
