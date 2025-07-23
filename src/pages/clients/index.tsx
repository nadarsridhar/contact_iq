import { useEffect, useState } from 'react';
// import { DataTable } from '../clients/components/data-table';
import { getClientsApi } from '@/services/apiClientDetails';
import { desktopColumns, mobileColumns } from './components/columns';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { ITotalRecords } from '@/utils/interfaces';
import { useIsMobile } from '@/hooks';
import { DataTable } from '@/components/ui/data-table/data-table';
import { PAGE_ACTION_TYPE } from '../recent-calls/components/data-table-pagination';

const RECORDS_PER_PAGE = 10;

function Clients() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [totalRecords, setTotalRecords] = useState<ITotalRecords>();
  const [page, setPage] = useState(0);

  const { agent } = useAuth();
  const isMobile = useIsMobile();

  async function fetchClients(payload) {
    try {
      const { Data: data, MetaData: totalRecordsData } = await getClientsApi(
        payload
      );
      setClients(data);
      setTotalRecords(totalRecordsData);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const payload = {
      UserId: agent.UserId,
      RecordsPerPage: RECORDS_PER_PAGE,
      SearchText: searchText,
      StartIndex: 0,
    };

    setIsLoading(true);
    setPage(0);

    const handler = setTimeout(() => fetchClients(payload), 500);
    return () => clearTimeout(handler);
  }, [agent, searchText]);

  const handlePageChange = (type: string) => {
    if (isLoading) return;
    const nextPageNumber = type === PAGE_ACTION_TYPE.PREV ? page - 1 : page + 1;
    setPage(nextPageNumber);

    const payload = {
      UserId: agent.UserId,
      RecordsPerPage: RECORDS_PER_PAGE,
      SearchText: searchText,
      StartIndex: nextPageNumber * RECORDS_PER_PAGE,
    };

    setIsLoading(true);
    fetchClients(payload);
  };

  return (
    <div className=" h-full flex-1 flex-col p-8 pt-0 mb-4 flex overflow-auto">
      <div>
        <div className="my-4">
          <Input
            placeholder="Search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            className="max-w-sm border rounded-md"
            isSearch
            onClear={() => setSearchText('')}
          />
        </div>
      </div>

      {false ? (
        <ClientListLoader />
      ) : (
        <DataTable
          data={clients}
          columns={isMobile ? mobileColumns : desktopColumns}
          totalRecords={null}
          page={page}
          recordsToDisplay={RECORDS_PER_PAGE}
          handlePageChange={handlePageChange}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

// TODO: Implement skeleton loader
function ClientListLoader() {
  return null;
  return (
    <div className=" shadow rounded-md p-4 max-w-sm w-full mx-auto">
      <div className="animate-pulse flex space-x-4">
        {/* <div className="rounded-full bg-slate-200 h-10 w-10"></div> */}
        <div className="flex-1 space-y-6 py-1">
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
          <div className="flex justify-between items-center">
            <div className="space-y-3 w-32">
              <div className="h-2  bg-slate-200 rounded col-span-2"></div>
              <div className="h-2  bg-slate-200 rounded"></div>
            </div>
            <div className="p-6 bg-slate-200 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Clients;
