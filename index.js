import app from "./src/app.js";
import { PORT } from "./src/config.js";

app.listen(PORT);
console.log(`Server on port http://192.168.0.19:${PORT}`);
