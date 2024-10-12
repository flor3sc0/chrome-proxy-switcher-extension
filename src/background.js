let allowedDomains = [];
let isProxyActive = false;

let animationFrame = 0;
const iconFrames = [
    'icons/active_icon16.png',
    'icons/icon16.png',
];

function setProxy(host, port) {
    chrome.proxy.settings.set(
        {
            value: {
                mode: "pac_script",
                pacScript: {
                    data: generatePacScript(host, port)
                }
            },
            scope: "regular"
        },
        () => {
            console.log(`Proxy set to: ${host}:${port}`);
            isProxyActive = true; // Update proxy status
        }
    );
}

function generatePacScript(host, port) {
    return `
    function FindProxyForURL(url, host) {
        const allowedDomains = ${JSON.stringify(allowedDomains)};

        if (allowedDomains.length === 0) {
            return "PROXY ${host}:${port}";
        }

        for (var i = 0; i < allowedDomains.length; i++) {
            if (shExpMatch(host, allowedDomains[i])) {
                return "PROXY ${host}:${port}";
            }
        }
        return "DIRECT"; 
    }
    `;
}


function updateIcon() {
    chrome.action.setIcon({ path: isProxyActive ? iconFrames[animationFrame] : 'icons/icon16.png' });

    animationFrame = (animationFrame + 1) % iconFrames.length;
}

setInterval(() => {
    if (isProxyActive) {
        updateIcon();
    }
}, 500);


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "setProxy") {
        setProxy(request.host, request.port);
        updateIcon();
        sendResponse({ status: "success" });
        return true;
    }

    if (request.action === "saveProxySettings") {
        allowedDomains = request.domains.split(",").map(domain => domain.trim()).filter(Boolean);

        if (isProxyActive) {
            chrome.proxy.settings.clear({
                scope: "regular"
            }, () => { })
            setProxy(request.host, request.port);
        }

        sendResponse({ status: "success" });
        return true;
    }

    if (request.action === "disableProxy") {
        chrome.proxy.settings.clear({
            scope: "regular"
        }, () => {
            console.log("Proxy disabled.");
            isProxyActive = false; // Update proxy status
            updateIcon();
            sendResponse({ status: "success" });
        });
        return true;
    }

    if (request.action === "getProxyStatus") {
        sendResponse({ status: "success", isActive: isProxyActive });
        return true;
    }

    return false;
});
