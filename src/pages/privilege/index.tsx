import { usePrivilege } from "@/contexts/PrivilegeContext";
import CreatePrivilegeTemplate from "./CreatePrivilegeTemplate";

function Privileges() {
  const { isSetPrivilegeAllowed } = usePrivilege();
  if (!isSetPrivilegeAllowed) return null;

  return (
    <div className="container px-2 md:mx-16 mb-8 md:mb-0">
      <h2 className="textAgent text-3xl font-bold text-primary whitespace-nowrap">Privileges</h2>
      <CreatePrivilegeTemplate />
    </div>
  );
}

export default Privileges;
