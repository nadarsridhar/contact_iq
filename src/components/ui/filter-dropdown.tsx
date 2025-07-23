import { Filter } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ICallFilter, ITagFilter } from '@/utils/interfaces';

interface FilterDropdownProps {
  selectedFilter: ICallFilter | ITagFilter;
  options: ICallFilter[] | ITagFilter[];
  onChange: (selectedFilters: ICallFilter | ITagFilter) => void;
}

export function FilterDropdown({
  options,
  onChange,
  selectedFilter,
}: FilterDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="min-w-[150px]" asChild>
        <Button variant="outline" className="justify-start">
          <Filter className="mr-2 h-4 w-4" />

          <div className="flex items-center gap-2">
            <p>{selectedFilter?.key}</p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {/* <DropdownMenuLabel>Filter Options</DropdownMenuLabel> */}
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.key}
            checked={selectedFilter.key == option.key}
            onCheckedChange={() => onChange(option)}
          >
            {option.key}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
