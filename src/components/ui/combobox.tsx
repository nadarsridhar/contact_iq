import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn, trimString } from "@/lib/utils";

export function Combobox({
  data = [],
  label = "",
  setValue,
  getValues,
  disabled = false,
  setSearchText,
  ...field
}) {
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const value = getValues();

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // TODO: Implement key down
    return;
    if (!open) {
      if (
        event.key === "Enter" ||
        event.key === " " ||
        event.key === "ArrowDown"
      ) {
        setOpen(true);
        setSelectedIndex(0);
        event.preventDefault();
      }
    } else {
      switch (event.key) {
        case "ArrowUp":
          setSelectedIndex((prevIndex) =>
            prevIndex > 0 ? prevIndex - 1 : data.length - 1
          );
          const indexToUpdate1 =
            selectedIndex > 0 ? selectedIndex - 1 : data.length - 1;
          setValue(String(data[indexToUpdate1].value));
          event.preventDefault();
          break;

        case "ArrowDown":
          setSelectedIndex((prevIndex) =>
            prevIndex < data.length - 1 ? prevIndex + 1 : 0
          );
          const indexToUpdate =
            selectedIndex < data.length - 1 ? selectedIndex + 1 : 0;
          setValue(String(data[indexToUpdate].value));

          event.preventDefault();
          break;

        case "Enter":
          if (selectedIndex !== -1) {
            setValue(String(data[selectedIndex].value));
            setOpen(false);
          }
          event.preventDefault();
          break;

        case "Escape":
          setOpen(false);
          event.preventDefault();
          break;
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="border-slate-200 overflow-hidden" asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="flex justify-between w-full border border-gray-300"
          disabled={disabled}
        >
          <span className="text-gray-800">
            {value
              ? trimString(
                  data.find((d) => d.value == value)?.label ?? value,
                  10
                )
              : `Select ${label}`}
          </span>

          {value ? (
            <X
              onClick={() => {
                if (field.name) setValue(field.name, "");
                setValue("");
              }}
              size={14}
              className="opacity-50"
            />
          ) : (
            <ChevronsUpDown size={12} className="opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" onKeyDown={handleKeyDown}>
        <Command>
          {setSearchText && (
            <CommandInput
              onChangeCapture={(e) =>
                setSearchText ? setSearchText(e.target.value) : () => {}
              }
              placeholder={`Search ${label}...`}
              className="h-9"
            />
          )}
          <CommandList>
            <CommandEmpty>No {label} found.</CommandEmpty>
            <CommandGroup>
              {data.map((d) => (
                <CommandItem
                  key={d.value}
                  value={d.value}
                  onSelect={() => {
                    if (field.name) setValue(field.name, String(d.value));
                    setValue(String(d.value));
                    setOpen(false);
                  }}
                >
                  <div className="flex justify-between items-center pr-4 w-full">
                    <span>{d.label}</span>
                  </div>
                  <Check
                    size={12}
                    className={cn(
                      "ml-auto",
                      value === d.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
