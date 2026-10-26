export type ToolRecord = { id?:string; kind:string; name:string; source_url:string; observed_at:string; expires_at:string; status:string; game?:string; platform?:string; region?:string; currency?:string; socket?:string; includes?:Record<string,boolean|null>; supported_cpus?:{cpu_id:string;minimum_bios:string;source_url:string}[]; monthly_price?:number|null; annual_price?:number|null; };
export function validRecord(record:ToolRecord,now?:Date):boolean;
export function editionMatrix(records:ToolRecord[],game:string,platform:string,now?:Date):{columns:string[];rows:{feature:string;values:string[]}[];sources:{name:string;url:string;observed:string}[]};
export function releaseTime(iso:string,zone:string,now?:Date):{local:string;utc:string;secondsRemaining:number;occurred:boolean};
export function compatibility(cpu:ToolRecord|undefined,board:ToolRecord|undefined,now?:Date):{status:string;reason:string;minimum_bios?:string;source_url?:string};
export function comparePlans(records:ToolRecord[],region:string,currency:string,now?:Date):{name:string;monthly:number|null;annual:number|null;effectiveMonthly:number|null;source:string;observed:string}[];
