const elements = {};

document.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    restoreOptions();

    [
        elements.proxyHost,
        elements.proxyPort,
        elements.customWhiteList,
        elements.customBypassList
    ].forEach((element) => {
        element.addEventListener('input', saveOptions);
    });

    [elements.useAnywhere].forEach((element) => {
        element.addEventListener('change', saveOptions);
    });

    elements.toggleProxy.addEventListener('change', toggleProxy);
    elements.addCurrentDomain.addEventListener('click', addCurrentDomainToWhitelist);

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

function cacheElements() {
    elements.proxyHost = document.getElementById('proxyHost');
    elements.proxyPort = document.getElementById('proxyPort');
    elements.customWhiteList = document.getElementById('customWhiteList');
    elements.customBypassList = document.getElementById('customBypassList');
    elements.useAnywhere = document.getElementById('useAnywhere');
    elements.toggleProxy = document.getElementById('toggleProxy');
    elements.addCurrentDomain = document.getElementById('addCurrentDomain');
    elements.currentStatus = document.getElementById('currentStatus');
    elements.statusIcon = document.getElementById('statusIcon');
    elements.errorMessage = document.getElementById('error-message');
}

function saveOptions() {
    const options = getOptionsFromForm();
    applyModeState(options.useAnywhere);
    chrome.storage.local.set(options);
}

function restoreOptions() {
    chrome.storage.local.get(storageProps, (items) => {
        applyOptionsToForm(items);
        applyModeState(items.useAnywhere || false);
        updateCurrentStatus(items.isProxyActive || false);
        syncProxyState();
    });
}

function getOptionsFromForm() {
    return {
        proxyHost: elements.proxyHost.value.trim(),
        proxyPort: elements.proxyPort.value.trim(),
        customWhiteList: elements.customWhiteList.value,
        customBypassList: elements.customBypassList.value,
        useAnywhere: elements.useAnywhere.checked
    };
}

function applyOptionsToForm(items) {
    elements.toggleProxy.checked = items.isProxyActive || false;
    elements.proxyHost.value = items.proxyHost || '';
    elements.proxyPort.value = items.proxyPort || '';
    elements.useAnywhere.checked = items.useAnywhere || false;
    elements.customWhiteList.value = items.customWhiteList || '';
    elements.customBypassList.value = items.customBypassList || '';
}

function applyModeState(useAnywhere) {
    updateHtmlCustomListContainer('whitelist-container', useAnywhere);
    updateHtmlCustomListContainer('bypass-list-container', !useAnywhere);
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
    elements.currentStatus.textContent = statusText;
    elements.currentStatus.className = `status ${statusClass}`;
    elements.statusIcon.innerHTML = svg;
}

function updateHtmlCustomListContainer(containerId, isDisabled) {
    const container = document.getElementById(containerId);
    const controls = container.querySelectorAll('input, textarea, button');

    controls.forEach((control) => {
        if (control.dataset.keepEnabled === 'true') {
            return;
        }

        control.disabled = isDisabled;
    });
}

function showError(errorMessage) {
    elements.errorMessage.textContent = errorMessage;
    elements.errorMessage.classList.remove('hidden');
}

function clearError() {
    elements.errorMessage.textContent = '';
    elements.errorMessage.classList.add('hidden');
}

function validateProxyForm() {
    const host = elements.proxyHost.value.trim();
    const port = Number.parseInt(elements.proxyPort.value.trim(), 10);

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

        elements.toggleProxy.checked = response.isActive;
        updateCurrentStatus(response.isActive);
    });
}

async function addCurrentDomainToWhitelist() {
    clearError();

    try {
        const domain = await getCurrentTabDomain();
        const entries = parseDomainList(elements.customWhiteList.value);

        if (entries.includes(domain)) {
            showError(`Domain "${domain}" is already in the whitelist`);
            return;
        }

        entries.push(domain);
        elements.customWhiteList.value = entries.join('\n');
        saveOptions();
    } catch (error) {
        showError(error.message || 'Failed to add current site');
    }
}

function getCurrentTabDomain() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
            }

            const tab = tabs && tabs[0];
            const url = tab && tab.url;

            if (!url) {
                reject(new Error('Could not read the current tab URL'));
                return;
            }

            try {
                const parsedUrl = new URL(url);

                if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
                    reject(new Error('Only http and https pages can be added to the whitelist'));
                    return;
                }

                resolve(normalizeDomainForWhitelist(parsedUrl.hostname));
            } catch (error) {
                reject(new Error('Could not parse the current tab URL'));
            }
        });
    });
}
