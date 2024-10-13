document.addEventListener('DOMContentLoaded', () => {
    restoreOptions();
    document.getElementById('proxyHost').addEventListener('input', saveOptions);
    document.getElementById('proxyPort').addEventListener('input', saveOptions);
    document.getElementById('customWhiteList').addEventListener('input', saveOptions);
    document.getElementById('useAnywhere').addEventListener('change', saveOptions);
    document.getElementById('addYbDomains').addEventListener('change', saveOptions);
    document.getElementById('toggleProxy').addEventListener('change', toggleProxy);
});

function saveOptions() {
    const proxyHost = document.getElementById('proxyHost').value;
    const proxyPort = document.getElementById('proxyPort').value;
    const useAnywhere = document.getElementById('useAnywhere').checked;
    const addYbDomains = document.getElementById('addYbDomains').checked;
    const customWhiteList = document.getElementById('customWhiteList').value;

    updateHtmlWhitelistContainer(useAnywhere);

    chrome.storage.local.set({
        proxyHost: proxyHost,
        proxyPort: proxyPort,
        customWhiteList: customWhiteList,
        useAnywhere: useAnywhere,
        addYbDomains: addYbDomains,
    });
}


function restoreOptions() {
    chrome.storage.local.get(storageProps, (items) => {
        document.getElementById('toggleProxy').checked = items.isProxyActive || false;
        document.getElementById('proxyHost').value = items.proxyHost || '';
        document.getElementById('proxyPort').value = items.proxyPort || '';
        document.getElementById('useAnywhere').checked = items.useAnywhere || false;
        document.getElementById('addYbDomains').checked = items.addYbDomains || false;
        document.getElementById('customWhiteList').value = items.customWhiteList || '';

        updateHtmlWhitelistContainer(items.useAnywhere);
        updateCurrentStatus(items.isProxyActive);
    });
}

function toggleProxy(event) {
    const isChecked = event.target.checked;

    const action = isChecked ? "startProxy" : "stopProxy";

    chrome.runtime.sendMessage({ action: action }, (response) => {
        if (response.status === "success") {
            chrome.storage.local.set({ isProxyActive: isChecked });
            updateCurrentStatus(isChecked);
        }
    });
}

function updateCurrentStatus(isActive) {
    if (isActive === true) {
        updateHtmlStatusContainer("ACTIVE", "active", activeSvg);
        return;
    }

    updateHtmlStatusContainer("INACTIVE", "inactive", inactiveSvg);
}

function updateHtmlStatusContainer(statusText, statusClass, svg) {
    let statusDiv = document.getElementById('currentStatus');
    let statusIcon = document.getElementById('statusIcon');

    statusDiv.textContent = `State: ${statusText}`;
    statusDiv.className = `status ${statusClass}`;
    statusIcon.innerHTML = svg;
}

function updateHtmlWhitelistContainer(isDisabled) {
    const container = document.getElementById('whitelist-container');
    const elements = container.querySelectorAll('input, textarea');

    elements.forEach(element => {
        element.disabled = isDisabled;
    });
}