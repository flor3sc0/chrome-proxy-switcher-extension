function getPacConfig(host, port, whiteList, useAnywhere) {
    let pacScriptData = generatePacScriptForAllDomains(host, port);

    if (useAnywhere === false && whiteList.length !== 0) {
        pacScriptData = generatePacScriptForWhiteList(host, port, whiteList);
    }

    return {
        value: {
            mode: "pac_script",
            pacScript: {
                data: pacScriptData
            }
        },
        scope: "regular"
    }
}

function generatePacScriptForAllDomains(host, port) {
    return `
    function FindProxyForURL(url, host) {
        return "PROXY ${host}:${port}";
    }
    `;
}

function generatePacScriptForWhiteList(host, port, whiteList) {
    return `
    function FindProxyForURL(url, host) {
        const whiteList = ${JSON.stringify(whiteList)};

        for (var i = 0; i < whiteList.length; i++) {
            if (shExpMatch(host, whiteList[i])) {
                return "PROXY ${host}:${port}";
            }
        }
        return "DIRECT";
    }
    `;
}