import { EyeIcon, EyeOffIcon } from 'lucide-react';
import * as React from 'react'
import { createPortal } from 'react-dom'
import { Button } from './ui/button';

interface Column {
  id: string;
  header: string;
  isVisible: boolean;
}

interface ProfilerModalProps {
  columns: Column[];
  onColumnVisibilityChange: (columnId: string, isVisible: boolean) => void;
  handleDefaultColumnSizes: () => void;
}

function ProfilerModal({columns, onColumnVisibilityChange, handleDefaultColumnSizes }: ProfilerModalProps) {
  return <div className='bg-white shadow-lg rounded-lg p-3 w-[350px]'>
      <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-3">
        <p className="text-base font-semibold text-gray-800">Column Settings</p>
      </div>

      <div className="flex">
        <div className="flex-1 max-h-[400px] overflow-y-auto pr-3">
          {columns.map((column) => (
            <div 
              key={column.id} 
              className="flex items-center gap-2 py-2 px-2 hover:bg-gray-50 rounded-md transition-colors duration-200 border-b border-gray-100 last:border-0"
            >
              <input 
                type="checkbox" 
                id={column.id}
                checked={column.isVisible}
                onChange={(e) => onColumnVisibilityChange(column.id, e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label 
                htmlFor={column.id} 
                className="flex-1 text-sm text-gray-700 cursor-pointer hover:text-gray-900"
              >
                {column.header || column.id}
              </label>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 ml-3 min-w-[120px]">
          <Button 
            size="sm"
            variant="outline"
            className="text-sm font-medium w-full" 
            onClick={() => {
              columns.forEach(col => onColumnVisibilityChange(col.id, true));
            }}
          >
            Show All
          </Button>          
          <Button 
            size="sm"
            variant="outline"
            className="text-sm font-medium w-full"
            onClick={handleDefaultColumnSizes}
          >
            Reset Sizes
          </Button>
        </div>
      </div>
    </div>
}

export default ProfilerModal