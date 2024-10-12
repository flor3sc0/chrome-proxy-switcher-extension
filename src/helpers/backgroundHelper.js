function getPacConfig(host, port, allowedDomains) {
    return {
        value: {
            mode: "pac_script",
            pacScript: {
                data: generatePacScript(host, port, allowedDomains)
            }
        },
        scope: "regular"
    }
}

function generatePacScript(host, port, allowedDomains) {
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

let animationFrame = 0;
const iconFrames = [
    'icons/icon16.png',
    'icons/active_icon16.png',
];

function startSwitchIcon() {
    return setInterval(() => {
        updateIcon(true);
    }, 500);
}

function stopIconSwitcher(intervalId) {
    if (intervalId) {
        clearInterval(intervalId);
    }
}

function updateIcon(isProxyActive) {
    iconPath = 'icons/icon16.png';
    if (isProxyActive === true) {
        iconPath = iconFrames[animationFrame];
        animationFrame = (animationFrame + 1) % iconFrames.length;
    }

    chrome.action.setIcon({ path: iconPath });
}