import { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { TradeException } from "@/schemas/tradeException";
import { format } from "date-fns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const desktopColumns: ColumnDef<TradeException>[] = [
  {
    accessorKey: "TradeTime",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trade Time" />
    ),
    size: 150,
    minSize: 150,
    maxSize: 300,
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span className="ml-2">
            {format(new Date(Number(row.original.TradeTime) * 1000), "PPpp")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "TradeNumber",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trade No." />
    ),
    size: 90,
    minSize: 90,
    maxSize: 200,
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span className="ml-2">{row.original.TradeNumber}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "Exchange",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Exchange" />
    ),
    size: 90,
    minSize: 90,
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
    size: 200,
    minSize: 200,
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
    accessorKey: "ClientId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client ID" />
    ),
    size: 90,
    minSize: 90,
    maxSize: 100,
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
    accessorKey: "TradedPrice",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Traded Price." />
    ),
    size: 100,
    minSize: 100,
    maxSize: 200,
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span className="ml-2">{row.original.TradedPrice}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "TradedQuantity",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Traded Qty." />
    ),
    size: 100,
    minSize: 100,
    maxSize: 200,
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span className="ml-2">{row.original.TradedQuantity}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "TradedValue",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Traded Value" />
    ),
    size: 100,
    minSize: 100,
    maxSize: 200,
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span className="ml-2">{row.original.TradedValue}</span>
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
    maxSize: 200,
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
    accessorKey: "DealerId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CTCL ID" />
    ),
    size: 80,
    minSize: 80,
    maxSize: 200,
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <span className="ml-2">{row.original.DealerId}</span>
        </div>
      );
    },
  },
];

// TODO: Edit mobile columns
export const mobileColumns: ColumnDef<TradeException>[] = [
  {
    id: "DealerId",
    cell: ({ row }) => {
      const {
        TradeTime,
        TradeNumber,
        Exchange,
        Scrip,
        ClientId,
        ClientName,
        TradedQuantity,
        TradedPrice,
        TradedValue,
        DealerId,
      } = row.original;

      const tradedTime =
        TradeTime === 0
          ? 0
          : format(new Date(Number(row.original.TradeTime) * 1000), "PPpp");

      return (
        <Accordion type="single" collapsible className="w-full p-0">
          <AccordionItem className="p-0" value="item-1">
            <AccordionTrigger className="p-0 px-2">
              <li
                key={ClientId}
                className="flex justify-between hover:bg-gray-50 transition-colors duration-150 ease-in-out w-full"
              >
                <div className="flex justify-between items-center space-x-4 w-full">
                  <div className="flex justify-center items-center gap-2 w-full mr-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {ClientId} {ClientName ? "-" : ""} {ClientName}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            </AccordionTrigger>
            <AccordionContent className="mx-4 m-4 rounded-lg border text-gray-700 border-gray-300 p-4 space-y-1 text-xs">
              <div className="flex justify-between items-center rounded-lg">
                <span>Traded Time</span>
                <span>{tradedTime}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span>Traded No.</span>
                <span>{TradeNumber}</span>
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
                <span>Client ID</span>
                <span>{ClientId}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span>Client Name</span>
                <span>{ClientName}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span>Traded Price</span>
                <span>{TradedPrice}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span>Traded Quantity</span>
                <span>{TradedQuantity}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span>Traded Value</span>
                <span>{TradedValue}</span>
              </div>
              <div className="flex justify-between items-center rounded-lg">
                <span>CTCL ID</span>
                <span>{DealerId}</span>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
