function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}

export function MarkdownView({ markdown }: { markdown: string }) {
  const lines = markdown.split("\n");
  const elements = [];
  let listItems: string[] = [];

  function flushList() {
    if (listItems.length === 0) {
      return;
    }
    elements.push(
      <ul key={`list-${elements.length}`}>
        {listItems.map((item) => (
          <li key={item}>{renderInline(item)}</li>
        ))}
      </ul>
    );
    listItems = [];
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      continue;
    }

    if (line.startsWith("## ")) {
      flushList();
      elements.push(<h3 key={`h-${elements.length}`}>{line.slice(3)}</h3>);
      continue;
    }

    if (line.startsWith("- ")) {
      listItems.push(line.slice(2));
      continue;
    }

    flushList();
    elements.push(<p key={`p-${elements.length}`}>{renderInline(line)}</p>);
  }

  flushList();

  return <div className="markdown-view">{elements}</div>;
}
