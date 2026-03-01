// ── Config ──
const API_BASE = "http://localhost:8080/api/inbox";

// ── DOM refs ──
const textArea = document.getElementById("inbox-text");
const sendBtn = document.getElementById("send-btn");
const btnText = sendBtn.querySelector(".btn-text");
const btnLoading = sendBtn.querySelector(".btn-loading");
const feedback = document.getElementById("feedback");
const badge = document.getElementById("pending-badge");
const sendUrlBtn = document.getElementById("send-url-btn");

// ── Init: populate from current tab ──
document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Get current tab info
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        if (tab?.url && (tab.url.startsWith("http://") || tab.url.startsWith("https://"))) {
            // Try to get selected text from the page
            try {
                const [result] = await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: () => window.getSelection().toString().trim(),
                });

                if (result?.result) {
                    textArea.value = result.result;
                }
            } catch (e) {
                // scripting may fail on some pages (e.g. chrome web store), ignore
                console.log("Could not get selection:", e.message);
            }
        }

        // Load pending count
        loadPendingCount();

        // Focus textarea
        textArea.focus();
    } catch (err) {
        console.error("Init error:", err);
    }
});

// ── Load pending inbox items count ──
async function loadPendingCount() {
    try {
        const res = await fetch(`${API_BASE}/count/pending`);
        if (res.ok) {
            const json = await res.json();
            const count = json.data ?? json;
            if (count > 0) {
                badge.textContent = count;
                badge.classList.add("visible");
            }
        }
    } catch (e) {
        // API not reachable, ignore
    }
}

// ── Send URL of current page ──
sendUrlBtn.addEventListener("click", handleSendUrl);

async function handleSendUrl() {
    clearFeedback();
    sendUrlBtn.disabled = true;
    sendUrlBtn.textContent = "Enviando...";

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        const url = tab?.url ?? "";
        const isWebUrl = url.startsWith("http://") || url.startsWith("https://");

        if (!isWebUrl) {
            const reason = !url
                ? "No hay pestaña activa"
                : url.startsWith("chrome://") || url.startsWith("chrome-extension://")
                    ? "Las páginas internas de Chrome no se pueden capturar"
                    : url.startsWith("file://")
                        ? "Los archivos locales no se pueden capturar (actívalo en chrome://extensions)"
                        : "Solo se pueden capturar páginas web (http/https)";
            showFeedback(`✗ ${reason}`, "error");
            return;
        }

        const content = tab.title ? `${tab.title}\n${tab.url}` : tab.url;

        const res = await fetch(`${API_BASE}/capture`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                content,
                contentType: "LINK",
                sourceUrl: tab.url,
                metadata: {
                    capturedFrom: "browser_extension_quick_url",
                    capturedAt: new Date().toISOString(),
                    pageTitle: tab.title || "",
                },
            }),
        });

        if (res.ok) {
            const json = await res.json();
            const item = json.data ?? json;
            showFeedback(`✓ URL capturada — ${item.detectedType ?? "guardado"}`, "success");
            loadPendingCount();
            setTimeout(() => window.close(), 1200);
        } else {
            const errText = await res.text();
            let msg = "Error al enviar";
            try {
                const errJson = JSON.parse(errText);
                msg = errJson.message || errJson.error || msg;
            } catch (_) { }
            showFeedback(`✗ ${msg}`, "error");
        }
    } catch (err) {
        showFeedback("✗ No se pudo conectar al servidor", "error");
        console.error("Send URL error:", err);
    } finally {
        sendUrlBtn.disabled = false;
        sendUrlBtn.textContent = "🔗 Enviar URL de esta página";
    }
}

// ── Send to Inbox ──
sendBtn.addEventListener("click", handleSend);

// Ctrl+Enter shortcut to send
textArea.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSend();
    }
});

async function handleSend() {
    const content = textArea.value.trim();

    if (!content) {
        showFeedback("Escribe algo antes de enviar", "error");
        textArea.focus();
        return;
    }

    // Build payload using the CaptureRequestDto (auto-detect)
    const payload = {
        content: content,
        metadata: {
            capturedFrom: "browser_extension",
            capturedAt: new Date().toISOString(),
        },
    };

    setLoading(true);
    clearFeedback();

    try {
        const res = await fetch(`${API_BASE}/capture`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            const json = await res.json();
            const item = json.data ?? json;
            showFeedback(`✓ Capturado — ${item.detectedType ?? "guardado"}`, "success");

            // Clear form
            textArea.value = "";

            // Refresh pending count
            loadPendingCount();

            // Auto-close popup after success (delay so user sees feedback)
            setTimeout(() => window.close(), 1200);
        } else {
            const errText = await res.text();
            let msg = "Error al enviar";
            try {
                const errJson = JSON.parse(errText);
                msg = errJson.message || errJson.error || msg;
            } catch (_) { }
            showFeedback(`✗ ${msg}`, "error");
        }
    } catch (err) {
        showFeedback("✗ No se pudo conectar al servidor", "error");
        console.error("Send error:", err);
    } finally {
        setLoading(false);
    }
}

// ── UI Helpers ──
function setLoading(loading) {
    sendBtn.disabled = loading;
    btnText.style.display = loading ? "none" : "inline";
    btnLoading.style.display = loading ? "inline" : "none";
}

function showFeedback(msg, type) {
    feedback.textContent = msg;
    feedback.className = type; // "success" or "error"
}

function clearFeedback() {
    feedback.textContent = "";
    feedback.className = "";
}