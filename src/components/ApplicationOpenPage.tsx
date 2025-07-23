"use client";

import { AlertTriangle, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ApplicationOpenPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-slate-900">
             Already Open
          </CardTitle>
          <CardDescription className="text-slate-600 mt-2">
            This application is currently running in another browser tab
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h3 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              What you can do:
            </h3>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Switch to the existing tab to continue working</li>
              <li>• Close the other tab and refresh this page</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => window.location.reload()}
              className="w-full"
              variant="default"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Page
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-slate-500">
              This prevents data conflicts and ensures optimal performance
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
