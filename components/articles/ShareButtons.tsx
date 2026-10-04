'use client';

import { useState } from 'react';
import { Twitter, Facebook, Linkedin, Link2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type ShareButtonsProps = {
  url: string;
  title: string;
  variant?: 'horizontal' | 'vertical';
  className?: string;
};

export function ShareButtons({ url, title, variant = 'horizontal', className = '' }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const buttons = [
    {
      label: 'Share on Twitter',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      label: 'Share on Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: 'Share on LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ];

  const containerClass = variant === 'vertical'
    ? 'flex flex-col gap-2'
    : 'flex flex-wrap items-center gap-2';

  return (
    <div className={cn(containerClass, className)}>
      <span className={variant === 'vertical' ? 'text-xs font-semibold text-muted-foreground' : 'sr-only'}>
        Share
      </span>
      {buttons.map((btn) => (
        <a
          key={btn.label}
          href={btn.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={btn.label}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <btn.icon className="h-4 w-4" />
        </a>
      ))}
      <button
        onClick={handleCopy}
        aria-label="Copy link"
        className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        {copied ? <Check className="h-4 w-4 text-primary" /> : <Link2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
