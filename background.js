// Service worker: Tab Organizer (hostname-based)
console.log("Service worker loaded: Tab Organizer");

function hostnameOf(url) {
  try {
    const u = new URL(url || "");
    return u.hostname || (u.protocol === "file:" ? "file" : "");
  } catch {
    if (!url) return "";
    if (url.startsWith("chrome://")) return "chrome";
    if (url.startsWith("edge://")) return "edge";
    if (url.startsWith("about:")) return "about";
    if (url.startsWith("view-source:")) {
      try {
        const inner = url.replace("view-source:", "");
        const u2 = new URL(inner);
        return u2.hostname || "view-source";
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
    const sorted = [...tabs].sort((a, b) => a.index - b.index);
    const pinned = sorted.filter(t => t.pinned);
    const unpinned = sorted.filter(t => !t.pinned);

    const keyOrder = [];
    const keyToTabs = new Map();
    for (const t of unpinned) {
      const key = hostnameOf(t.url);
      if (!keyToTabs.has(key)) {
        keyOrder.push(key);
        keyToTabs.set(key, []);
      }
      keyToTabs.get(key).push(t);
    }

    let nextIndex = pinned.length ? pinned[pinned.length - 1].index + 1 : 0;
    for (const key of keyOrder) {
      const group = keyToTabs.get(key);
      const idsInOrder = group.map(t => t.id);
      await chrome.tabs.move(idsInOrder, { index: nextIndex });
      nextIndex += idsInOrder.length;
    }
  } catch (err) {
    console.error("Tab grouping (hostname) failed:", err);
  }
});
