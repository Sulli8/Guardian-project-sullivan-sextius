console.log('custom_sw.js registered');


// Cache tous les appels api
addEventListener('fetch', event => {
    event.respondWith(
        // look in the cache for the resource
        caches.match(event.request).then(async response => {
            if (response) {
                console.log('return cached resource');
                // is in cache, respond with the cached resource
                return response;
            }
            console.log('put cached resource');
            // if not found fetch it from the network
            const networkResponse = await fetch(event.request);
            // response needs to be cloned if going to be used more than once
            const clonedResponse = networkResponse.clone();

            // save response to runtime cache for later use
            const runtimeCache = await caches.open('runtime-cache');
            runtimeCache.put(event.request, networkResponse);

            // respond with the cloned network response
            return Promise.resolve(clonedResponse);
        })
    );
});


//gere les pushs notifications
self.addEventListener('push', onPushEventHandler);
function onPushEventHandler(event) {
    console.log('pushevent');
    async function onPush(event){
      // wake up SW on all pages
      await self.clients.claim();
      // get payload
      const payload = await event.data.json();
      console.log('payloadupdated', payload);
      console.log('showLocalNotification Y');
      const options = {
        //data: url,
        data: "something you want to send within the notification, such an URL to open",
        //body: text,
        body: payload.notification.body,
        //icon: image,
        vibrate: [200, 100, 200],
        //tag: tag,
        //image: image,
        badge: "https://spyna.it/icons/favicon.ico",
        actions: [{ action: "Detail", title: "View", icon: "https://via.placeholder.com/128/ff0000" }]
      };
      //call the method showNotification to show the notification
      event.waitUntil(self.registration.showNotification(payload.notification.title, options));
    }


    event.waitUntil(
        onPush(event)
          .catch((error) => onPushFailure(error, event))
      );
  }




  async function onPushFailure(error, event) {
    console.log('push error');
  }