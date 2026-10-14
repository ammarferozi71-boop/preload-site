// Shared tool-data types (identical in every site repo).
export type SourceTier = 'official' | 'major_outlet' | 'minor_outlet' | 'community';
export interface FactSource { url: string; excerpt: string; tier: SourceTier; as_of: string; title?: string }
export interface BaseRow { id: number; status: 'verified'; as_of: string; fact_ids: number[] }
export interface Dataset<Row extends BaseRow, Extra = {}> {
  tool: string;
  generated_at: string;
  max_age_days: number;
  min_rows?: number;
  rows: Row[];
  facts: Record<string, FactSource>;
  extra?: Extra;
}
