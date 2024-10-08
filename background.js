let allowedDomains = [];

// Устанавливаем прокси-сервер
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
        }
    );
}

// Генерируем PAC-скрипт для работы с доменами
function generatePacScript(host, port) {
    return `
    function FindProxyForURL(url, host) {
        const allowedDomains = ${JSON.stringify(allowedDomains)};

        for (var i = 0; i < allowedDomains.length; i++) {
            if (shExpMatch(host, allowedDomains[i])) {
                return "PROXY ${host}:${port}";
            }
        }
        return "DIRECT";
    }
    `;
}

// Обработка установки прокси из popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "setProxy") {
        const { host, port, domains } = request;
        allowedDomains = domains; // Сохраняем список доменов
        setProxy(host, port);
        sendResponse({ status: "success" });
    }
});
