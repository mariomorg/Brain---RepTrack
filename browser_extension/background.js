// ── Background Service Worker ──
// Handles context menu and keyboard shortcuts for quick capture

const API_BASE = "http://localhost:8080/api/inbox";

// ── Create context menu on install ──
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "capture-selection",
        title: "Enviar al Inbox: \"%s\"",
        contexts: ["selection"],
    });

    chrome.contextMenus.create({
        id: "capture-page",
        title: "Enviar esta página al Inbox",
        contexts: ["page"],
    });

    chrome.contextMenus.create({
        id: "capture-link",
        title: "Enviar enlace al Inbox",
        contexts: ["link"],
    });

    chrome.contextMenus.create({
        id: "capture-image",
        title: "Enviar imagen al Inbox",
        contexts: ["image"],
    });
});

// ── Handle context menu clicks ──
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    let content = "";
    let contentType = "";
    let sourceUrl = tab?.url || "";

    switch (info.menuItemId) {
        case "capture-selection":
            content = info.selectionText || "";
            contentType = "BROWSER_EXTENSION";
            break;

        case "capture-page":
            content = tab?.title ? `${tab.title}\n${tab.url}` : tab.url;
            contentType = "LINK";
            sourceUrl = tab.url;
            break;

        case "capture-link":
            content = info.linkUrl || "";
            contentType = "LINK";
            break;

        case "capture-image":
            content = info.srcUrl || "";
            contentType = "LINK";
            break;
    }

    if (!content) return;

    try {
        const res = await fetch(`${API_BASE}/capture`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                content,
                contentType,
                sourceUrl,
                metadata: {
                    capturedFrom: "browser_extension_context_menu",
                    capturedAt: new Date().toISOString(),
                    pageTitle: tab?.title || "",
                },
            }),
        });

        if (res.ok) {
            // Show success notification via badge
            chrome.action.setBadgeText({ text: "✓", tabId: tab.id });
            chrome.action.setBadgeBackgroundColor({ color: "#4ade80", tabId: tab.id });
            setTimeout(() => {
                chrome.action.setBadgeText({ text: "", tabId: tab.id });
            }, 2000);
        } else {
            chrome.action.setBadgeText({ text: "!", tabId: tab.id });
            chrome.action.setBadgeBackgroundColor({ color: "#f87171", tabId: tab.id });
            setTimeout(() => {
                chrome.action.setBadgeText({ text: "", tabId: tab.id });
            }, 3000);
        }
    } catch (err) {
        console.error("Context menu capture failed:", err);
        chrome.action.setBadgeText({ text: "!", tabId: tab.id });
        chrome.action.setBadgeBackgroundColor({ color: "#f87171", tabId: tab.id });
        setTimeout(() => {
            chrome.action.setBadgeText({ text: "", tabId: tab.id });
        }, 3000);
    }
});

// ── Handle keyboard shortcut: capture-page ──
chrome.commands.onCommand.addListener(async (command) => {
    if (command === "capture-page") {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.url || tab.url.startsWith("chrome://")) return;

        const content = tab.title ? `${tab.title}\n${tab.url}` : tab.url;

        try {
            const res = await fetch(`${API_BASE}/capture`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content,
                    contentType: "LINK",
                    sourceUrl: tab.url,
                    metadata: {
                        capturedFrom: "browser_extension_shortcut",
                        capturedAt: new Date().toISOString(),
                        pageTitle: tab.title || "",
                    },
                }),
            });

            if (res.ok) {
                chrome.action.setBadgeText({ text: "✓", tabId: tab.id });
                chrome.action.setBadgeBackgroundColor({ color: "#4ade80", tabId: tab.id });
            } else {
                chrome.action.setBadgeText({ text: "!", tabId: tab.id });
                chrome.action.setBadgeBackgroundColor({ color: "#f87171", tabId: tab.id });
            }

            setTimeout(() => {
                chrome.action.setBadgeText({ text: "", tabId: tab.id });
            }, 2000);
        } catch (err) {
            console.error("Shortcut capture failed:", err);
        }
    }
});
