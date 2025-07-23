import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { TradeException } from "@/schemas/tradeException";
import { useTradeReportDetails } from "@/hooks/useTradeReportDetailsModal";
import { format } from "date-fns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const desktopColumns: ColumnDef<TradeException>[] = [
  {
    accessorKey: "OrderTime",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order Time" />
    ),
    size: 150,
    minSize: 150,
    maxSize: 300,
    cell: ({ row }) => {
      if (Number(row.original.OrderTime) === 0) return null;

      return (
        <div className="flex items-center">
          <span className="ml-2">
            {format(new Date(Number(row.original.OrderTime) * 1000), "PPpp")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "ClientId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client ID" />
    ),
    size: 80,
    minSize: 80,
    maxSize: 200,
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span className="ml-2">{row.original.ClientId}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "ClientName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client Name" />
    ),
    size: 100,
    minSize: 100,
    maxSize: 200,
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span className="ml-2">{row.original.ClientName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "Exchange",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Exchange" />
    ),
    size: 80,
    minSize: 80,
    maxSize: 200,
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span className="ml-2">{row.original.Exchange}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "Scrip",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Security Desc." />
    ),
    size: 180,
    minSize: 180,
    maxSize: 200,
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span className="ml-2">{row.original.Scrip}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "BuySellIndicator",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order Type" />
    ),
    size: 100,
    minSize: 100,
    maxSize: 100,
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span className="ml-2">
            {row.original.BuySellIndicator.toUpperCase()}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "Instrument",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Instrument" />
    ),
    size: 100,
    minSize: 100,
    maxSize: 100,
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span className="ml-2">{row.original.Instrument}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "TradeCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trade Count" />
    ),
    size: 85,
    minSize: 85,
    maxSize: 85,
    cell: ({ row }) => {
      const { onOpen, setData } = useTradeReportDetails();

      const handleShowTradesByOrder = () => {
        onOpen();
        setData({ modalData: { orderDetails: row.original } });
      };

      return (
        <div className="flex space-x-2 justify-center w-full">
          <p
            onClick={handleShowTradesByOrder}
            className="max-w-[500px] truncate font-bold cursor-pointer underline text-blue-600"
          >
            {row.original.TradeCount}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "OrderNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order No." />
    ),
    size: 120,
    minSize: 120,
    maxSize: 120,
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span className="ml-2">{row.original.OrderNumber}</span>
        </div>
      );
    },
  },

  {
    accessorKey: "DealerId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CTCL ID" />
    ),
    size: 80,
    minSize: 80,
    maxSize: 80,
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span className="ml-2">{row.original.DealerId}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "UserId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User ID" />
    ),
    size: 80,
    minSize: 80,
    maxSize: 80,
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span className="ml-2">{row.original.UserId}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "UserName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Username" />
    ),
    size: 100,
    minSize: 100,
    maxSize: 200,
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span className="ml-2">{row.original.UserName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "TerminalCode",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Terminal Code" />
    ),
    size: 120,
    minSize: 120,
    maxSize: 200,
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span className="ml-2">{row.original.TerminalCode}</span>
        </div>
      );
    },
  },
];

// TODO: Edit mobile columns
export const mobileColumns: ColumnDef<TradeException>[] = [
  {
    id: "OrderNumber",
    accessorKey: "OrderNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order" />
    ),
    cell: ({ row }) => {
      const {
        OrderTime,
        StartTime,
        ClientId,
        ClientName,
        Exchange,
        Scrip,
        BuySellIndicator,
        Instrument,
        TradeCount,
        OrderNumber,
        DealerId,
        UserId,
        UserName,
        TerminalCode,
      } = row.original;

      const orderTime =
        Number(OrderTime) === 0
          ? 0
          : format(new Date(Number(OrderTime) * 1000), "PPpp");

      const callTime =
        StartTime == 0 ? 0 : format(new Date(Number(StartTime) * 1000), "PPpp");

      return (
        <Accordion type="single" collapsible className="w-full p-0">
          <AccordionItem className="p-0" value="item-1">
            <AccordionTrigger className="p-0 px-2">
              <li
                key={UserId}
                className="flex justify-between hover:bg-gray-50 transition-colors duration-150 ease-in-out w-full"
              >
                <div className="flex justify-between items-center space-x-4 w-full mr-4">
                  <div className="flex items-center justify-between w-full gap-2 hover:bg-gray-100">
                    <div className={`flex-1 min-w-0`}>
                      <p>{OrderNumber}</p>
                    </div>
                  </div>
                </div>
              </li>
            </AccordionTrigger>
            <AccordionContent className="mx-4 m-4 rounded-lg border text-gray-700 border-gray-300 p-4 space-y-1 text-xs">
              <div className="flex justify-between items-center rounded-lg">
                <span>Order Time</span>
                <span>{orderTime}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span>Call Time</span>
                <span>{callTime}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span>Client ID</span>
                <span>{ClientId}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span>Client Name</span>
                <span>{ClientName}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span>Exchange</span>
                <span>{Exchange}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span>Security Desc.</span>
                <span>{Scrip}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span>Order Type</span>
                <span>{BuySellIndicator.toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span>Instrument</span>
                <span>{Instrument}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span>Trade Count</span>
                <span>{TradeCount}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span>Order Number</span>
                <span>{OrderNumber}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span>Dealer ID</span>
                <span>{DealerId}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span>User ID</span>
                <span>{UserId}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span>Username</span>
                <span>{UserName}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span>Terminal Code</span>
                <span>{TerminalCode}</span>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    },
  },
];
