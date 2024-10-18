function buildWhitelist(customWhiteList, addYbDomains) {
    let result = customWhiteList.split(",").map(domain => domain.trim()).filter(Boolean);

    if (addYbDomains === true) {
        result.push(...youtubeDomains)
    }

    return result;
}

function startIconSwitcher() {
    return setInterval(() => {
        updateIcon(true);
    }, 1000);
}

function stopIconSwitcher(intervalId) {
    if (intervalId) {
        clearInterval(intervalId);
    }
    updateIcon(false);
}

let animationFrame = 0;

function updateIcon(isProxyActive) {
    iconPath = 'icons/icon16.png';
    if (isProxyActive === true) {
        iconPath = iconFrames[animationFrame];
        animationFrame = (animationFrame + 1) % iconFrames.length;
    }

    chrome.action.setIcon({ path: iconPath });
}