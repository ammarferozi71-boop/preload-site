import Image from 'next/image';
import Link from 'next/link';
import { Info, AlertTriangle, Lightbulb, Quote } from 'lucide-react';
import type { BodyBlock } from '@/lib/types';

type ArticleBodyProps = {
  body: BodyBlock[];
  className?: string;
};

const CALLOUT_STYLES = {
  info: {
    icon: Info,
    border: 'border-accent/40',
    bg: 'bg-accent/10',
    text: 'text-accent',
  },
  warning: {
    icon: AlertTriangle,
    border: 'border-destructive/40',
    bg: 'bg-destructive/10',
    text: 'text-destructive',
  },
  tip: {
    icon: Lightbulb,
    border: 'border-primary/40',
    bg: 'bg-primary/10',
    text: 'text-primary',
  },
};

// Minimal inline formatting for article text: **bold**, *italic* and [label](url).
const INLINE_PATTERN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\)|\*[^*\s][^*]*\*)/g;

function renderInline(text: string): React.ReactNode {
  const parts = text.split(INLINE_PATTERN);
  if (parts.length === 1) return text;
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link) {
      const className = 'text-primary underline underline-offset-4';
      return link[2].startsWith('/') ? (
        <Link key={index} href={link[2]} className={className}>{link[1]}</Link>
      ) : (
        <a key={index} href={link[2]} target="_blank" rel="noopener noreferrer" className={className}>{link[1]}</a>
      );
    }
    if (part.length > 2 && part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

export function ArticleBody({ body, className = '' }: ArticleBodyProps) {
  return (
    <div className={`article-content ${className}`}>
      {body.map((block, index) => {
        switch (block.type) {
          case 'heading': {
            const HeadingTag = `h${block.level}` as 'h2' | 'h3' | 'h4';
            return (
              <HeadingTag key={index} id={block.id}>
                {block.text}
              </HeadingTag>
            );
          }

          case 'link':
            return <p key={index}><a href={block.url} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">{block.text}</a></p>;

          case 'paragraph':
            return <p key={index}>{renderInline(block.text)}</p>;

          case 'quote':
            return (
              <blockquote
                key={index}
                className="my-6 border-l-4 border-primary pl-6"
              >
                <Quote className="mb-2 h-5 w-5 text-primary/40" />
                <p className="text-lg font-heading font-medium italic leading-relaxed text-foreground">
                  {block.text}
                </p>
                {block.attribution && (
                  <cite className="mt-2 block text-sm text-muted-foreground">
                    &mdash; {block.attribution}
                  </cite>
                )}
              </blockquote>
            );

          case 'image':
            return (
              <figure key={index} className="my-6">
                <Image
                  src={block.url}
                  alt={block.alt}
                  width={1600}
                  height={900}
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="h-auto w-full rounded-lg border border-border"
                />
                {block.caption && (
                  <figcaption className="mt-2 text-center text-sm text-muted-foreground">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );

          case 'list':
            return block.ordered ? (
              <ol key={index} className="my-4 list-decimal space-y-2 pl-6">
                {block.items.map((item, i) => (
                  <li key={i} className="leading-relaxed">{renderInline(item)}</li>
                ))}
              </ol>
            ) : (
              <ul key={index} className="my-4 list-disc space-y-2 pl-6">
                {block.items.map((item, i) => (
                  <li key={i} className="leading-relaxed">{renderInline(item)}</li>
                ))}
              </ul>
            );

          case 'callout': {
            const variant = block.variant || 'info';
            const styles = CALLOUT_STYLES[variant];
            const Icon = styles.icon;
            return (
              <div key={index} className={`my-6 flex gap-4 rounded-lg border ${styles.border} ${styles.bg} p-4`}>
                <Icon className={`h-5 w-5 shrink-0 ${styles.text}`} />
                <p className="text-sm leading-relaxed text-foreground">{renderInline(block.text)}</p>
              </div>
            );
          }

          case 'video':
            return (
              <div key={index} className="my-6 aspect-video w-full overflow-hidden rounded-lg">
                <iframe
                  src={block.url}
                  title={block.title || 'Embedded video'}
                  className="h-full w-full"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            );

          case 'table':
            return (
              <div key={index} className="my-6 overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-secondary">
                    <tr>
                      {block.headers.map((header, i) => (
                        <th key={i} className="px-4 py-3 text-left font-heading font-bold">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, i) => (
                      <tr key={i} className="border-t border-border">
                        {row.map((cell, j) => (
                          <td key={j} className="px-4 py-3">{renderInline(cell)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
