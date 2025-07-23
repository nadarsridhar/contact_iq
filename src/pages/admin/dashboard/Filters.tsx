import { MultiSelectDropdown } from "@/components/multi-select-dropdown";
import { Combobox } from "@/components/ui/combobox";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { usePrivilege } from "@/contexts/PrivilegeContext";
import { disableFuture } from "@/lib/utils";
import {
  CALL_CATEGORY_FILTER,
  TAG_FILTER,
  TRADE_EXCEPTION_REPORT_TYPE,
  USER_CATEGORY_FILTER,
} from "@/utils/filter";
import { useEffect, useState } from "react";
import { DateRangePicker, DatePicker } from "rsuite";

function Filters({
  showSearchText = true,
  searchText,
  setSearchText,
  setBranchSearchText,
  selectedCallFilter,
  selectedReportType,
  setSelectedReportType,
  handleFilterChange,
  dateRange,
  handleRangeChange,
  selectedTags,
  setSelectedTags,
  showTags = true,
  showBranches = true,
  setSelectedBranches,
  selectedBranches,
  comboboxBranches,
  selectedUserCategory,
  setSelectedUserCategory,
  loggedInFilter,
  setLoggedInFilter,
  showDateRange = false,
  showDatePicker = false,
  datePicker,
  handleDatePicker,
}: any) {
  const {
    isSearchFilterAllowed,
    isDateFilterAllowed,
    isStatusFilterAllowed,
    isTagsFilterAllowed,
    isBranchFilterAllowed,
    isDatePickerFilterAllowed,
  } = usePrivilege();

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.target.blur();
    }
  };

  const [isSingleCalendar, setIsSingleCalendar] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsSingleCalendar(width < 768);
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {selectedReportType && (
        <FilterDropdown
          selectedFilter={selectedReportType}
          options={TRADE_EXCEPTION_REPORT_TYPE}
          onChange={setSelectedReportType}
        />
      )}

      {isSearchFilterAllowed && showSearchText && (
        <Input
          placeholder="Min 3 characters.."
          value={searchText}
          onChange={(event) => {
            setSearchText(event.target.value);
          }}
          className="max-w-sm border border-stale-200"
          onClear={() => setSearchText("")}
          enterKeyHint="go"
          onKeyDown={(e) => {
            handleKeyDown(e);
          }}
          isSearch
        />
      )}

      {isDateFilterAllowed && showDateRange && (
        <DateRangePicker
          showOneCalendar={isSingleCalendar}
          format="yyyy-MM-dd"
          value={dateRange}
          onChange={handleRangeChange}
          placeholder="Select a date range"
          size="xs"
          disabledDate={disableFuture}
          cleanable={false}
        />
      )}

      {isStatusFilterAllowed && selectedCallFilter && (
        <FilterDropdown
          selectedFilter={selectedCallFilter}
          options={CALL_CATEGORY_FILTER}
          onChange={handleFilterChange}
        />
      )}

      {isTagsFilterAllowed && selectedTags && (
        <MultiSelectDropdown
          selectedItems={selectedTags}
          setSelectedItems={setSelectedTags}
          options={TAG_FILTER}
          label="tags"
          showTags={showTags}
        />
      )}

      {/* TODO: Add privilege */}
      {selectedUserCategory && (
        <MultiSelectDropdown
          selectedItems={selectedUserCategory}
          setSelectedItems={setSelectedUserCategory}
          options={USER_CATEGORY_FILTER}
          label="User category"
          showTags={false}
        />
      )}

      {isBranchFilterAllowed && showBranches && (
        <Combobox
          className={"w-[80px]"}
          data={comboboxBranches}
          label="branch"
          setValue={setSelectedBranches}
          getValues={() => selectedBranches}
          setSearchText={setBranchSearchText}
        />
      )}

      {(loggedInFilter == -1 || loggedInFilter == 1 || loggedInFilter == 0) && (
        <Select
          value={loggedInFilter}
          onValueChange={(val) => setLoggedInFilter(val)}
        >
          <SelectTrigger className="md:w-[80px]">
            <SelectValue placeholder="All Users" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={-1}>All Users</SelectItem>
            <SelectItem value={1}>Logged In Users</SelectItem>
            <SelectItem value={0}>Logged Off Users</SelectItem>
          </SelectContent>
        </Select>
      )}

      {showDatePicker && isDatePickerFilterAllowed && (
        <DatePicker
          format="yyyy-MM-dd"
          value={datePicker}
          onChange={handleDatePicker}
          placeholder="Select a date range"
          size="xs"
          disabledDate={disableFuture}
          cleanable={false}
        />
      )}
    </>
  );
}

export default Filters;
