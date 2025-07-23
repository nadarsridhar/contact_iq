import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  getPrivilegeName,
  hasPrivilege,
  privilegeGroups,
  PrivilegeKey,
  PrivilegeValue,
  DISABLE_PRIVILEGE,
} from "@/utils/privileges";

function ConfigurePrivileges({ state, dispatch }) {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(privilegeGroups)
          .filter(([groupKey]) => state[groupKey] !== DISABLE_PRIVILEGE)
          .map(([groupKey, groupValue]) => (
            <div className="border shadow p-2" key={groupKey}>
              <h3 className="text-sm font-semibold mb-2 capitalize">
                {getPrivilegeName(groupKey)}
              </h3>
              <div className="flex flex-wrap items-center gap-4">
                {Object.entries(groupValue)
                  .filter(([key]) => isNaN(Number(key)))
                  .map(([key, value]) => {
                    return (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          checked={hasPrivilege(
                            state[groupKey],
                            value as PrivilegeValue
                          )}
                          onCheckedChange={() =>
                            dispatch({
                              type: groupKey as PrivilegeKey,
                              value: value as PrivilegeValue,
                            })
                          }
                        />
                        <Label
                          htmlFor={`${groupKey}-${key}`}
                          className="text-xs"
                        >
                          {key}
                        </Label>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default ConfigurePrivileges;
