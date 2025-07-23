import { DataTable } from './components/data-table';
import columns from './components/columns';

function RecentCalls({ calls, totalRecords, page, setPage, recordsToDisplay }) {
  return (
    <>
      <div className="h-full flex-1 flex-col p-8 pt-0 mb-4 flex overflow-auto">
        <DataTable
          data={calls}
          columns={columns}
          totalRecords={totalRecords}
          page={page}
          setPage={setPage}
          recordsToDisplay={recordsToDisplay}
        />
      </div>
    </>
  );
}

export default RecentCalls;
