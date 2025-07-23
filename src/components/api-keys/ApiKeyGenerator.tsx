"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Copy,
  Eye,
  EyeOff,
  Key,
  Plus,
  Trash2,
  AlertTriangle,
  Loader2,
  RefreshCcw,
} from "lucide-react";
import { toast } from "sonner";
import { generateKeyApi, getKeyApi } from "@/services/apiAuth";
import { format } from "date-fns";

interface ApiKey {
  UserId: string;
  APIKey: string;
  SecretKey: string;
  token: string;
  CreatedDate: number;
  LastUpdateDate: number;
  ActiveFlag: number;
}
const initialState = {
  UserId: "",
  APIKey: "",
  SecretKey: "",
  token: "",
  CreatedDate: 0,
  LastUpdateDate: 0,
  ActiveFlag: 1,
};

export default function ApiKeyGenerator() {
  const [data, setData] = useState<ApiKey>(initialState);
  const [loading, setLoading] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard`);
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return key;
    return (
      key.substring(0, 8) +
      "•".repeat(key.length - 12) +
      key.substring(key.length - 4)
    );
  };

  async function fetchApiKeys() {
    try {
      const { Data: data } = (await getKeyApi()) || 0;
      setData(data ?? initialState);
    } catch (error) {
    } finally {
      // setIsLoading(false);
    }
  }
  async function generateNewApiKey() {
    try {
      setLoading(true);
      const { Data: data } = await generateKeyApi();
      setData(data);
      console.log("Result", data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const newlyGenerated = false;
  let lastUpdatedDate = data?.LastUpdateDate
    ? format(new Date(Number(data?.LastUpdateDate) * 1000), "PPpp")
    : "";

  return (
    <div className="w-full mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-primary font-bold  text-center md:text-left">
            API Keys
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your API keys for secure access to our services
          </p>
        </div>

        <Button
          disabled={loading}
          type="submit"
          className="my-4"
          onClick={generateNewApiKey}
        >
          <Key className="w-4 h-4 mr-2" />
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Generating keys.." : "Generate Key"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardDescription className="flex justify-between items-center">
            {data?.APIKey ? (
              <p>Manage and monitor your existing API key</p>
            ) : (
              <p>No API Keys generated</p>
            )}
          </CardDescription>
        </CardHeader>
        {data?.APIKey && (
          <CardContent className="md:flex justify-between">
            <div>
              <h3>API Key</h3>
              <div className="flex items-center space-x-2">
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {visibleKeys.has("key1") ? data.APIKey : maskKey(data.APIKey)}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => toggleKeyVisibility("key1")}
                >
                  {visibleKeys.has("key1") ? (
                    <EyeOff className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(data.APIKey, "API key")}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div>
              <h3>Secret Key</h3>
              <div className="flex items-center space-x-2">
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {visibleKeys.has("key2")
                    ? data.SecretKey
                    : maskKey(data.SecretKey)}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => toggleKeyVisibility("key2")}
                >
                  {visibleKeys.has("key2") ? (
                    <EyeOff className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(data.SecretKey, "Secret key")}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {data?.APIKey && (
        <div className="flex justify-end items-center text-sm">
          <p>Last updated at: {lastUpdatedDate}</p>
        </div>
      )}
    </div>
  );
}
