document.getElementById("setProxy").addEventListener("click", () => {
    const host = document.getElementById("proxyHost").value;
    const port = parseInt(document.getElementById("proxyPort").value, 10);
    const domainsInput = document.getElementById("allowedDomains").value;
    const allowedDomains = domainsInput.split(",").map(domain => domain.trim()).filter(Boolean);

    if (host && !isNaN(port) && allowedDomains.length > 0) {
        chrome.runtime.sendMessage(
            { action: "setProxy", host: host, port: port, domains: allowedDomains },
            (response) => {
                if (response.status === "success") {
                    alert(`Прокси установлен: ${host}:${port} для доменов: ${allowedDomains.join(", ")}`);
                } else {
                    alert("Ошибка при установке прокси.");
                }
            }
        );
    } else {
        alert("Пожалуйста, введите правильные значения для хоста, порта и доменов.");
    }
});
