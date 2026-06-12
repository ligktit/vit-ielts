async function tryFetch(url: string) {
  try {
    const res = await fetch(url);
    if (res.ok) {
      const html = await res.text();
      const headStart = html.indexOf("<head>");
      const headEnd = html.indexOf("</head>");
      if (headStart !== -1 && headEnd !== -1) {
        console.log(`=== SERVER SIDE RENDERED HEAD FOR ${url} ===`);
        const head = html.slice(headStart, headEnd + 7);
        const regex = /<(style|link)[^>]*>([\s\S]*?<\/(style|link)>)?/gi;
        const matches = head.match(regex) || [];
        matches.forEach((m, idx) => {
          console.log(`${idx}: ${m.slice(0, 150)}`);
        });
        return true;
      }
    }
  } catch (e) {
    console.error(`Failed to fetch ${url}:`, e instanceof Error ? e.message : String(e));
  }
  return false;
}

async function main() {
  const ports = [3000, 3001];
  for (const port of ports) {
    const success = await tryFetch(`http://127.0.0.1:${port}/admin/mock-test-collections`);
    if (success) break;
  }
}

main().catch(console.error);
