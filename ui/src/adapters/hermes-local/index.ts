import type { UIAdapterModule } from "../types";
import { parseHermesStdoutLine } from "@fideliosai/adapter-hermes-local/ui";
import { HermesLocalConfigFields } from "./config-fields";
import { buildHermesConfig } from "@fideliosai/adapter-hermes-local/ui";

export const hermesLocalUIAdapter: UIAdapterModule = {
  type: "hermes_local",
  label: "Hermes Agent",
  parseStdoutLine: parseHermesStdoutLine,
  ConfigFields: HermesLocalConfigFields,
  buildAdapterConfig: buildHermesConfig,
};
