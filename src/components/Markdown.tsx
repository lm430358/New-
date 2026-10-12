import type { ComponentProps, ElementType } from "react";
import ReactMarkdown, { type Components, type ExtraProps } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/** Wraps a tag with fixed classes, dropping react-markdown's `node` prop so it never reaches the DOM. */
function styled<T extends ElementType>(Tag: T, className: string) {
  function Styled(props: ComponentProps<T> & ExtraProps) {
    const rest: Record<string, unknown> = { ...props };
    delete rest.node;
    const Component = Tag as ElementType;
    return <Component {...rest} className={className} />;
  }
  return Styled;
}

// Element styles live here rather than in a typography plugin so generated
// copy matches the rest of the app's type scale.
const components: Components = {
  h1: styled("h2", "text-lg font-semibold text-slate-900 mt-5 mb-2 first:mt-0"),
  h2: styled("h3", "text-base font-semibold text-slate-900 mt-5 mb-2 first:mt-0"),
  h3: styled("h4", "font-semibold text-slate-800 mt-4 mb-1.5 first:mt-0"),
  h4: styled("h5", "font-semibold text-slate-800 mt-3 mb-1 first:mt-0"),
  p: styled("p", "my-2 leading-relaxed"),
  ul: styled("ul", "list-disc pl-5 my-2 space-y-1"),
  ol: styled("ol", "list-decimal pl-5 my-2 space-y-1"),
  a: function Link(props) {
    const rest: Record<string, unknown> = { ...props };
    delete rest.node;
    return <a {...rest} className="text-violet-600 underline underline-offset-2" target="_blank" rel="noopener noreferrer" />;
  },
  blockquote: styled("blockquote", "border-l-2 border-violet-200 pl-3 my-3 text-slate-600 italic"),
  hr: styled("hr", "my-4 border-slate-100"),
  table: styled("table", "w-full text-left border-collapse my-3"),
  th: styled("th", "border-b border-slate-200 py-1.5 pr-3 font-semibold"),
  td: styled("td", "border-b border-slate-100 py-1.5 pr-3 align-top"),
  code: styled("code", "rounded bg-slate-100 px-1 py-0.5 text-[0.9em]"),
};

/** Renders AI-generated markdown (blog posts, lead magnets, sales pages). Raw HTML is not rendered. */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("break-words overflow-x-auto", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
