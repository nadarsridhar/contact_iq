import { usePrivilege } from "@/contexts/PrivilegeContext";
import TemplateMappingForm from "@/pages/admin/template-mapping/TemplateMappingForm";

export enum TEMPLATE_TYPE {
  BRANCH_TO_BRANCH = "1",
  AGENT_TO_AGENT = "2",
}

export const TEMPLATE_TYPES = [
  {
    label: "Branch to Branch",
    value: "1",
  },
  {
    label: "Agent to Agent",
    value: "2",
  },
];

function TemplateMapping() {
  const { isTemplateMappingAllowed } = usePrivilege();

  if (!isTemplateMappingAllowed) return null;

  return (
    <div className="py-2.5">
      <div className="flex justify-between items-end mb-2 py-4 false ">
        <h1 className="text-3xl text-primary font-bold">Template Mapping</h1>
      </div>
      <TemplateMappingForm />
    </div>
  );
}

export default TemplateMapping;
