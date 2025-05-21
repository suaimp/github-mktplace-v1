// filepath: [test_getPublisherServices.js](http://_vscodecontentref_/0)
import { getPublisherServices } from "./publisher_services_get";

(async () => {
  const data = await getPublisherServices();
  console.log("Resultado do teste:", data);
})();
