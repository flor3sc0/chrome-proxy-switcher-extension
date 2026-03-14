document.addEventListener('DOMContentLoaded', () => {
    restoreOptions();
    document.getElementById('proxyHost').addEventListener('input', saveOptions);
    document.getElementById('proxyPort').addEventListener('input', saveOptions);
    document.getElementById('customWhiteList').addEventListener('input', saveOptions);
    document.getElementById('customBlackList').addEventListener('input', saveOptions);
    document.getElementById('useAnywhere').addEventListener('change', saveOptions);
    document.getElementById('addYbDomains').addEventListener('change', saveOptions);
    document.getElementById('toggleProxy').addEventListener('change', toggleProxy);

    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && 'proxyError' in changes) {
            if (changes.proxyError.newValue) {
                showError(changes.proxyError.newValue);
            } else {
                clearError();
            }
        }
    });
});

function saveOptions() {
    const proxyHost = document.getElementById('proxyHost').value.trim();
    const proxyPort = document.getElementById('proxyPort').value.trim();
    const useAnywhere = document.getElementById('useAnywhere').checked;
    const addYbDomains = document.getElementById('addYbDomains').checked;
    const customWhiteList = document.getElementById('customWhiteList').value;
    const customBlackList = document.getElementById('customBlackList').value;

    updateHtmlCustomListContainer('whitelist-container', useAnywhere);
    updateHtmlCustomListContainer('blacklist-container', !useAnywhere);

    chrome.storage.local.set({
        proxyHost,
        proxyPort,
        customWhiteList,
        customBlackList,
        useAnywhere,
        addYbDomains
    });
}

function restoreOptions() {
    chrome.storage.local.get(storageProps, (items) => {
        const isActive = items.isProxyActive || false;
        document.getElementById('toggleProxy').checked = isActive;
        document.getElementById('proxyHost').value = items.proxyHost || '';
        document.getElementById('proxyPort').value = items.proxyPort || '';
        document.getElementById('useAnywhere').checked = items.useAnywhere || false;
        document.getElementById('addYbDomains').checked = items.addYbDomains || false;
        document.getElementById('customWhiteList').value = items.customWhiteList || '';
        document.getElementById('customBlackList').value = items.customBlackList || '';

        updateHtmlCustomListContainer('whitelist-container', items.useAnywhere);
        updateHtmlCustomListContainer('blacklist-container', !items.useAnywhere);
        updateCurrentStatus(isActive);
        syncProxyState();
    });
}

function toggleProxy(event) {
    const isChecked = event.target.checked;
    const action = isChecked ? 'startProxy' : 'stopProxy';
    const validationError = isChecked ? validateProxyForm() : '';

    clearError();

    if (validationError) {
        showError(validationError);
        event.target.checked = false;
        return;
    }

    event.target.disabled = true;

    chrome.runtime.sendMessage({ action }, (response) => {
        event.target.disabled = false;

        if (chrome.runtime.lastError) {
            showError(chrome.runtime.lastError.message);
            event.target.checked = !isChecked;
            updateCurrentStatus(!isChecked);
            return;
        }

        if (response && response.status === 'success') {
            chrome.storage.local.set({ isProxyActive: isChecked });
            updateCurrentStatus(isChecked);
            return;
        }

        showError((response && response.error) || 'Unknown error occurred');
        event.target.checked = !isChecked;
        updateCurrentStatus(!isChecked);
    });
}

function updateCurrentStatus(isActive) {
    if (isActive === true) {
        updateHtmlStatusContainer('ACTIVE', 'active', activeSvg);
        return;
    }

    updateHtmlStatusContainer('INACTIVE', 'inactive', inactiveSvg);
}

function updateHtmlStatusContainer(statusText, statusClass, svg) {
    const statusDiv = document.getElementById('currentStatus');
    const statusIcon = document.getElementById('statusIcon');

    statusDiv.textContent = `State: ${statusText}`;
    statusDiv.className = `status ${statusClass}`;
    statusIcon.innerHTML = svg;
}

function updateHtmlCustomListContainer(containerId, isDisabled) {
    const container = document.getElementById(containerId);
    const elements = container.querySelectorAll('input, textarea');

    elements.forEach((element) => {
        element.disabled = isDisabled;
    });
}

function showError(errorMessage) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = errorMessage;
    errorDiv.classList.remove('hidden');
}

function clearError() {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = '';
    errorDiv.classList.add('hidden');
}

function validateProxyForm() {
    const host = document.getElementById('proxyHost').value.trim();
    const port = Number.parseInt(document.getElementById('proxyPort').value.trim(), 10);

    if (!host) {
        return 'Proxy host is required';
    }

    if (!/^[a-zA-Z0-9.-]+$/.test(host)) {
        return 'Proxy host contains unsupported characters';
    }

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        return 'Proxy port must be a number between 1 and 65535';
    }

    return '';
}

function syncProxyState() {
    chrome.runtime.sendMessage({ action: 'getProxyState' }, (response) => {
        if (chrome.runtime.lastError || !response || response.status !== 'success') {
            return;
        }

        document.getElementById('toggleProxy').checked = response.isActive;
        updateCurrentStatus(response.isActive);
    });
}
