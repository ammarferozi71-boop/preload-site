import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { DISCOVERY } from '@/lib/discovery';
export function DiscoveryPaths(){return <section className="discovery-section mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" aria-labelledby="discovery-heading">
  <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Start with your question</p><h2 id="discovery-heading" className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">{DISCOVERY.heading}</h2></div><p className="max-w-md text-sm leading-relaxed text-muted-foreground">{DISCOVERY.intro}</p></div>
  <div className="grid gap-3 md:grid-cols-3">{DISCOVERY.paths.map(([label,title,description,href])=><Link key={href} href={href} className="discovery-card group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary"><p className="text-xs font-semibold tracking-widest text-muted-foreground">{label}</p><h3 className="mt-3 flex items-center justify-between gap-3 font-heading text-lg font-bold group-hover:text-primary">{title}<ArrowUpRight className="h-5 w-5 shrink-0 text-primary" aria-hidden="true"/></h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p></Link>)}</div>
</section>}
