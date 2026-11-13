import type { ReactNode } from "react";
import type { CrudFilters } from "@refinedev/core";
import type { ErpModule } from "../../erp/modules";
import type { ErpResource } from "../../services/erp";
import { CommerceDocumentsWorkspace } from "./commerceDocuments";
/** Normal app queues use the same authoritative documents as orders and purchases. */
export function ApprovalsPage(_props: { renderList?: (resource: ErpResource, module: ErpModule, filters: CrudFilters) => ReactNode }) {
  return <CommerceDocumentsWorkspace approvals />;
}
