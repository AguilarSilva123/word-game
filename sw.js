// Suba esse número sempre que mudar algum arquivo cacheado — é o único
// jeito do navegador saber que precisa baixar a versão nova.
const CACHE = "word-game-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
];

// "install": roda quando o SW é baixado pela primeira vez (ou quando o
// arquivo sw.js muda). Aqui baixamos tudo que o app precisa pra funcionar
// offline e guardamos num Cache Storage.
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting(); // ativa o novo SW sem esperar todas as abas fecharem
});

// "activate": roda quando o SW assume o controle. Aproveitamos para apagar
// caches de versões antigas (senão eles ficam acumulando pra sempre).
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// "fetch": intercepta toda requisição do app. Estratégia "cache-first":
// se já temos o arquivo salvo, devolve na hora (funciona offline);
// senão, busca na rede.
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
