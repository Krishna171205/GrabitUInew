import { schemas, type SeoSchema } from '@/lib/seo';

type SchemaName = keyof typeof schemas;

/**
 * Renders JSON-LD <script> tags into the document.
 * Works in server components because Next.js / React render
 * raw <script> tags to static HTML.
 *
 * CSP already permits 'unsafe-inline' for script-src, so inline
 * JSON-LD passes the nonce-free policy on letsgrabbit.com.
 */
export function SeoScripts({ names }: { names: SchemaName[] }) {
  return (
    <>
      {names.map((name) => (
        <script
          key={name}
          id={`seo-${name}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schemas[name] as SeoSchema, null, 0),
          }}
        />
      ))}
    </>
  );
}

