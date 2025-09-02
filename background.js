// Service worker: Tab Organizer (hostname + special google.com path buckets)
console.log("Service worker loaded: Tab Organizer (hostname + google apps)");

function firstPathSegment(pathname) {
  if (!pathname) return "";
  // "/maps/dir" -> "maps", "/" -> ""
  const parts = pathname.split("/").filter(Boolean);
  return parts.length ? parts[0].toLowerCase() : "";
}

function keyFor(url) {
  try {
    const u = new URL(url || "");
    const host = (u.hostname || "").toLowerCase();

    // Special handling: google.com (and www.google.com)
    // Group by first path segment so /maps, /flights, etc. are kept together.
    if (host === "google.com" || host === "www.google.com") {
      const seg = firstPathSegment(u.pathname);
      // If there's a segment, bucket as "google.com/<segment>", else just "google.com"
      return seg ? `${host}/${seg}` : host;
    }

    // Default behavior: group by hostname
    if (host) return host;

    // file:// URLs (no hostname)
    if (u.protocol === "file:") return "file";
    return "other";
  } catch {
    // Handle special/internal pages that don't parse as standard URLs
    if (!url) return "";
    const lower = url.toLowerCase();
    if (lower.startsWith("chrome://")) return "chrome";
    if (lower.startsWith("edge://")) return "edge";
    if (lower.startsWith("about:")) return "about";
    if (lower.startsWith("view-source:")) {
      // Try to parse inner URL after view-source:
      try {
        const inner = url.replace(/^view-source:/i, "");
        const u2 = new URL(inner);
        const host = (u2.hostname || "").toLowerCase();
        if (host === "google.com" || host === "www.google.com") {
          const seg = firstPathSegment(u2.pathname);
          return seg ? `${host}/${seg}` : host;
        }
        return host || "view-source";
      } catch {
        return "view-source";
      }
    }
    return "other";
  }
}

chrome.action.onClicked.addListener(async (clickedTab) => {
  try {
    const windowId = clickedTab.windowId;
    const tabs = await chrome.tabs.query({ windowId });

    // Keep visual order, split pinned vs unpinned
    const sorted = [...tabs].sort((a, b) => a.index - b.index);
    const pinned = sorted.filter(t => t.pinned);
    const unpinned = sorted.filter(t => !t.pinned);

    // Build buckets in first-appearance order
    const order = [];
    const buckets = new Map();

    for (const t of unpinned) {
      const k = keyFor(t.url);
      if (!buckets.has(k)) {
        order.push(k);
        buckets.set(k, []);
      }
      buckets.get(k).push(t);
    }

    // Place groups right after the last pinned tab
    let nextIndex = pinned.length ? pinned[pinned.length - 1].index + 1 : 0;

    for (const k of order) {
      const groupTabs = buckets.get(k);
      const idsInOrder = groupTabs.map(t => t.id);
      // Move as a contiguous block (preserves relative order)
      await chrome.tabs.move(idsInOrder, { index: nextIndex });
      nextIndex += idsInOrder.length;
    }
  } catch (err) {
    console.error("Tab grouping failed:", err);
  }
});