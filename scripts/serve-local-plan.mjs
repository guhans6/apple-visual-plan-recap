import path from "node:path";

import { createLocalPlanServer } from "../src/local-plan-server.js";

const planDir = path.resolve(process.argv[2] ?? "examples/apple-settings-pane");
const planSlug = process.argv[3] ?? path.basename(planDir);
const port = Number(process.env.PORT ?? 4173);

const server = createLocalPlanServer({ planDir, planSlug });
server.listen(port, () => {
  console.log(`Local visual plan: http://127.0.0.1:${port}`);
});
