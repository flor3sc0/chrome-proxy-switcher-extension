document.addEventListener('DOMContentLoaded', () => {
    restoreOptions();
    document.getElementById('startProxy').addEventListener('click', startProxy);
    document.getElementById('stopProxy').addEventListener('click', stopProxy);
    document.getElementById('proxyHost').addEventListener('input', saveOptions);
    document.getElementById('proxyPort').addEventListener('input', saveOptions);
    document.getElementById('allowedDomains').addEventListener('input', saveOptions);
});

function saveOptions() {
    let proxyHost = document.getElementById('proxyHost').value;
    let proxyPort = document.getElementById('proxyPort').value;
    let allowedDomains = document.getElementById('allowedDomains').value;

    chrome.storage.local.set({
        proxyHost: proxyHost,
        proxyPort: proxyPort,
        allowedDomains: allowedDomains
    });
}

function restoreOptions() {
    chrome.storage.local.get(['proxyHost', 'proxyPort', 'allowedDomains', 'isProxyActive'], (items) => {
        document.getElementById('proxyHost').value = items.proxyHost || '';
        document.getElementById('proxyPort').value = items.proxyPort || '';
        document.getElementById('allowedDomains').value = items.allowedDomains || '';
        updateCurrentStatus(items.isProxyActive);
    });
}

function startProxy() {
    chrome.runtime.sendMessage({ action: "startProxy" }, (response) => {
        if (response.status === "success") {
            chrome.storage.local.set({ isProxyActive: true });
            updateCurrentStatus(true);
        }
    });
}

function stopProxy() {
    chrome.runtime.sendMessage({ action: "stopProxy" }, (response) => {
        if (response.status === "success") {
            chrome.storage.local.set({ isProxyActive: false });
            updateCurrentStatus(false);
        }
    });
}

function updateCurrentStatus(isActive) {
    if (isActive === true) {
        updateCurrentStatusHtml("ACTIVE", "active", activeSvg);
        return;
    }

    updateCurrentStatusHtml("INACTIVE", "inactive", inactiveSvg);
}

function updateCurrentStatusHtml(statusText, statusClass, svg) {
    let statusDiv = document.getElementById('currentStatus');
    let statusIcon = document.getElementById('statusIcon');

    statusDiv.textContent = `State: ${statusText}`;
    statusDiv.className = `status ${statusClass}`;
    statusIcon.innerHTML = svg;
}