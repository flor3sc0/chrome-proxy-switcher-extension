document.addEventListener('DOMContentLoaded', function () {
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
    chrome.storage.local.get(['proxyHost', 'proxyPort', 'allowedDomains', 'isProxyActive'], function (items) {
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
    let statusDiv = document.getElementById('currentStatus');
    let statusIcon = document.getElementById('statusIcon');

    if (isActive === true) {
        statusDiv.textContent = "State: ACTIVE";
        statusDiv.className = "status active";
        statusIcon.innerHTML = activeSvg;
    } else if (isActive === false) {
        statusDiv.textContent = "State: INACTIVE";
        statusDiv.className = "status inactive";
        statusIcon.innerHTML = inactiveSvg;
    } else {
        statusDiv.textContent = "State: ERROR";
        statusDiv.className = "status error";
        statusIcon.innerHTML = errorSvg;
    }
}

const activeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <circle cx="12" cy="12" r="10" stroke="green" stroke-width="2" fill="none" />
  <path d="M10 12l2 2 4-4" stroke="green" stroke-width="2" fill="none" />
  <animate attributeType="CSS" attributeName="opacity" from="1" to="0" dur="1.5s" repeatCount="indefinite"/>
</svg>
`;

const inactiveSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <circle cx="12" cy="12" r="10" stroke="gray" stroke-width="2" fill="none" />
  <path d="M8 12h8" stroke="gray" stroke-width="2" fill="none" />
</svg>
`;

const errorSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <circle cx="12" cy="12" r="10" stroke="red" stroke-width="2" fill="none" />
  <path d="M12 8v4" stroke="red" stroke-width="2" fill="none" />
  <path d="M12 16h0" stroke="red" stroke-width="2" fill="none" />
  <animate attributeType="CSS" attributeName="opacity" from="1" to="0" dur="0.5s" repeatCount="indefinite"/>
</svg>
`;