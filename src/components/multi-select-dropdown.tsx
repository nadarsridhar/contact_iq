import { useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

export function MultiSelectDropdown({
  options,
  label,
  selectedItems,
  setSelectedItems,
  isSearchable = false,
  className = '',
  showTags = true
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={cn(`flex items-center relative`, className)}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between border-2  bg-gray-100 overflow-hidden"
          >
            {selectedItems.length > 0
              ? `${selectedItems.length} ${label} selected`
              : `${label}`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 absolute top-0 -right-20 border w-44">
          <Command>
            {isSearchable && (
              <CommandInput className='' placeholder={`Search ${label}...`} />
            )}
            <CommandList>
              <CommandEmpty>No {label} found.</CommandEmpty>
              <CommandGroup>
                {options
                  .filter((option) => option.value !== -1)
                  .map((option) => (
                    <CommandItem
                      key={option.value}
                      onSelect={() => {
                        setSelectedItems((prev) => {
                          const isSelected = prev.some(
                            (item) => item.value === option.value
                          );
                          if (isSelected) {
                            return prev.filter(
                              (item) => item.value !== option.value
                            );
                          } else {
                            return [...prev, option];
                          }
                        });
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedItems.some(
                            (item) => item.value === option.value
                          )
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                      {option.key}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
        {showTags && <div className="flex gap-3 max-w-[480px]">
          {selectedItems.map((item) => (
            <Badge
              key={item.value}
              variant="outline"
              className="bg-green-600 hover:bg-green-700 text-green-50"
            >
              <span className="whitespace-nowrap">{item.key}</span>
              <button
                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSelectedItems((prev) =>
                      prev.filter((i) => i.value !== item.value)
                    );
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={() =>
                  setSelectedItems((prev) =>
                    prev.filter((i) => i.value !== item.value)
                  )
                }
              >
                <X className="h-3 w-3 text-green-50 hover:text-green-100" />
              </button>
            </Badge>
          ))}
        </div>}
      </div>
    </Popover>
  );
}
