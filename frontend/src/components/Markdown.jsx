import { Children, isValidElement, memo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Check, Copy } from 'lucide-react';
import 'highlight.js/styles/github-dark.css';

const textOf = (node) => {
  if (node == null) return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isValidElement(node)) return textOf(node.props.children);
  return '';
};

function CodeBlock({ children }) {
  const [copied, setCopied] = useState(false);
  const code = Children.toArray(children)[0];
  const className = (isValidElement(code) && code.props.className) || '';
  const lang = /language-([\w-]+)/.exec(className)?.[1] || 'text';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(textOf(code).replace(/\n$/, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard blocked */ }
  };

  return (
    <div className="codeblock">
      <div className="codeblock-head">
        <span>{lang}</span>
        <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition hover:bg-white/10 hover:text-white">
          {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied' : 'Copy code'}
        </button>
      </div>
      <pre>{children}</pre>
    </div>
  );
}

function Markdown({ content, streaming = false }) {
  return (
    <div className={`md ${streaming ? 'streaming-caret' : ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
        components={{ pre: CodeBlock, a: ({ node, ...props }) => <a {...props} target="_blank" rel="noreferrer noopener" /> }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default memo(Markdown);
