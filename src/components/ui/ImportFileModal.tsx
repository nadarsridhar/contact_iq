import React, { ChangeEvent, RefObject } from 'react'
import { Input } from './input'
import { Button } from './button'
import { Loader2, Upload } from 'lucide-react'
import CrossIcon from '../../../public/SVGs/crossIcon.svg'


interface FilePors {
    handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
    handleFileUpload : () => void;
    isFileUploading: boolean;
    file: any;
    clearUploadedFile: () => void;
    fileInputRef: RefObject<HTMLInputElement>;
    setImportModalOpen: (open: boolean) => void;
}

function ImportFileModal({
    handleFileChange,
    handleFileUpload,
    isFileUploading,
    file,
    clearUploadedFile,
    fileInputRef,
    setImportModalOpen,
}: FilePors) {
    return (
        <div className="flex items-center justify-center fixed top-0 right-0 bottom-0 left-0 z-50">
        <div onClick={() => setImportModalOpen(false)} className='bg-black/70 fixed top-0 right-0 bottom-0 left-0'></div>
            {/* {isUserExportImportAllowed && !isMobile && ( */}
            <div className="bg-white rounded-lg shadow-lg max-w-[350px] p-6 relative z-10">
                <button
                    onClick={() => setImportModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700 bg-white rounded-full p-1 transition-colors absolute -top-4 -right-4"
                >
                    <img src={CrossIcon} alt="" />
                </button>
                <div className="flex justify-center items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Import CSV File</h2>
                </div>

                <div className="space-y-4">
                    <div className="w-full">
                        <Input
                            id="file"
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="w-full border-2 border-dashed border-gray-300 rounded-lg px-4 py-2 h-10 text-center cursor-pointer hover:border-[#f97316] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:ring-offset-2 transition-all"
                            disabled={isFileUploading}
                            ref={fileInputRef}
                            onClearFile={clearUploadedFile}
                            file={file}
                            aria-label="Upload CSV file"
                        />
                        <p className="mt-2 text-sm text-gray-500 text-center">
                            Only CSV files are supported
                        </p>
                    </div>

                    <Button
                        disabled={!Boolean(file) || isFileUploading}
                        className="w-full h-12 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg font-medium transition-colors"
                        onClick={()=>{handleFileUpload(); setImportModalOpen(false)}}
                    >
                        <div className="flex items-center justify-center space-x-2">
                            {isFileUploading ? (
                                <>
                                    <Loader2 className="animate-spin w-5 h-5" />
                                    <span>Importing File...</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    <span>Import File</span>
                                </>
                            )}
                        </div>
                    </Button>
                </div>
            </div>
            {/* )} */}

        </div>
    )
}

export default ImportFileModal
