"use client";
import { useState } from "react";
import Link from "next/link";
import { 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  Loader2, 
  Copy, 
  Layers, 
  Check, 
  Trash2
} from "lucide-react";

const SAMPLE_CSV = `brand,model,price,originalPrice,conditionGrade,storage,ram,city,listingType,partCategory,description
Apple,iPhone 15 Pro,84999,134900,Superb,128GB,8GB,Delhi,device,,Like new with original battery health 99%
Samsung,Galaxy S24 Ultra,89999,129999,Superb,256GB,12GB,Mumbai,device,,Flawless titanium frame with S-Pen
OnePlus,12 5G,46999,64999,Good,256GB,12GB,Bengaluru,device,,Minor signs of daily use, fast charger included
Xiaomi,14 Ultra,59999,99999,Superb,512GB,16GB,Hyderabad,device,,Leica quad camera master edition
Apple,iPhone 14 Display Screen,7499,15999,Superb,,,Delhi,part,display,Original OLED replacement display module
Samsung,Galaxy S23 Battery,2499,4999,Superb,,,Pan India,part,battery,Original 3900mAh battery replacement`;

const SAMPLE_JSON = [
  {
    "brand": "Apple",
    "model": "iPhone 15 Pro Max",
    "price": 99999,
    "originalPrice": 159900,
    "conditionGrade": "Superb",
    "storage": "256GB",
    "ram": "8GB",
    "city": "Delhi NCR",
    "listingType": "device",
    "description": "Mint condition, factory unlocked"
  },
  {
    "brand": "Google",
    "model": "Pixel 8 Pro",
    "price": 54999,
    "originalPrice": 106999,
    "conditionGrade": "Superb",
    "storage": "128GB",
    "ram": "12GB",
    "city": "Bengaluru",
    "listingType": "device",
    "description": "Google Tensor G3, official warranty active"
  }
];

export default function BulkUploadPage() {
  const [activeTab, setActiveTab] = useState("file");
  const [pastedText, setPastedText] = useState("");
  const [parsedItems, setParsedItems] = useState([]);
  const [parsingError, setParsingError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const parseCSV = (text) => {
    try {
      const lines = text.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row");
      
      const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ''));
      const items = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map(v => v.trim().replace(/^"|"$/g, ''));
        const obj = {};
        headers.forEach((h, index) => {
          obj[h] = values[index] !== undefined ? values[index] : "";
        });
        if (obj.brand && obj.model && obj.price) {
          items.push(obj);
        }
      }
      return items;
    } catch (err) {
      throw new Error("CSV Parsing failed: " + err.message);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setParsingError("");
    setUploadResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      try {
        if (file.name.endsWith(".json")) {
          const json = JSON.parse(content);
          if (!Array.isArray(json)) throw new Error("JSON file must contain an array of product objects");
          setParsedItems(json);
        } else {
          const items = parseCSV(content);
          setParsedItems(items);
        }
      } catch (err) {
        setParsingError(err.message);
        setParsedItems([]);
      }
    };
    reader.readAsText(file);
  };

  const handlePasteParse = () => {
    setParsingError("");
    setUploadResult(null);
    const text = pastedText.trim();
    if (!text) {
      setParsingError("Please paste CSV or JSON content first");
      return;
    }

    try {
      if (text.startsWith("[") || text.startsWith("{")) {
        const json = JSON.parse(text);
        const arr = Array.isArray(json) ? json : [json];
        setParsedItems(arr);
      } else {
        const items = parseCSV(text);
        setParsedItems(items);
      }
    } catch (err) {
      setParsingError("Unable to parse pasted content: " + err.message);
      setParsedItems([]);
    }
  };

  const loadSample = (type) => {
    if (type === "csv") {
      setPastedText(SAMPLE_CSV);
      try {
        const items = parseCSV(SAMPLE_CSV);
        setParsedItems(items);
        setParsingError("");
      } catch (e) {
        setParsingError(e.message);
      }
    } else {
      setPastedText(JSON.stringify(SAMPLE_JSON, null, 2));
      setParsedItems(SAMPLE_JSON);
      setParsingError("");
    }
    setActiveTab("paste");
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(SAMPLE_CSV);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBulkSubmit = async () => {
    if (parsedItems.length === 0) return;
    setLoading(true);
    setUploadResult(null);

    try {
      const res = await fetch("/api/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: parsedItems })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setUploadResult({
          success: true,
          count: data.count,
          message: data.message,
          errors: data.errors || []
        });
        setParsedItems([]);
        setPastedText("");
      } else {
        setUploadResult({
          success: false,
          error: data.error || "Bulk upload failed",
          errors: data.validationErrors || []
        });
      }
    } catch (err) {
      setUploadResult({
        success: false,
        error: "Network error during bulk import: " + err.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/products" className="text-gray-400 hover:text-black transition-colors p-2 rounded-xl hover:bg-gray-100">
            <ArrowLeft size={22} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-black tracking-tight flex items-center gap-2">
              <UploadCloud className="text-black" size={26} />
              Bulk Catalog Uploader
            </h1>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">
              Instantly sync multiple devices and spare parts to Website and Mobile App
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyTemplate}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white border border-gray-300 rounded-xl text-gray-800 hover:text-black hover:bg-gray-50 shadow-sm transition-all"
          >
            {copied ? <Check size={14} className="text-black" /> : <Copy size={14} />}
            {copied ? "Copied Sample CSV!" : "Copy CSV Template"}
          </button>
          <button
            onClick={() => loadSample("csv")}
            className="px-3 py-2 text-xs font-bold bg-gray-100 text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-200"
          >
            Load Sample CSV
          </button>
          <button
            onClick={() => loadSample("json")}
            className="px-3 py-2 text-xs font-bold bg-gray-100 text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-200"
          >
            Load Sample JSON
          </button>
        </div>
      </div>

      {/* RESULT NOTIFICATION */}
      {uploadResult && (
        <div className="p-4 rounded-2xl border border-gray-300 bg-gray-50 text-black">
          <div className="flex items-center gap-2 font-bold text-sm">
            {uploadResult.success ? <CheckCircle size={18} className="text-black" /> : <AlertCircle size={18} className="text-gray-600" />}
            {uploadResult.success ? `Success: ${uploadResult.message}` : `Import Failed: ${uploadResult.error}`}
          </div>
          {uploadResult.errors && uploadResult.errors.length > 0 && (
            <div className="mt-2 text-xs text-gray-600 space-y-1">
              <p className="font-semibold">Items skipped with warnings:</p>
              <ul className="list-disc pl-5">
                {uploadResult.errors.map((e, idx) => (
                  <li key={idx}>{e}</li>
                ))}
              </ul>
            </div>
          )}
          {uploadResult.success && (
            <div className="mt-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-black text-white px-3.5 py-1.5 rounded-lg hover:bg-gray-800 shadow-sm"
              >
                View in Live Catalog &rarr;
              </Link>
            </div>
          )}
        </div>
      )}

      {/* INPUT CARD */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* TABS */}
        <div className="flex border-b border-gray-200 bg-gray-50/50">
          <button
            onClick={() => setActiveTab("file")}
            className={`px-6 py-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "file" ? "border-black text-black bg-white" : "border-transparent text-gray-500 hover:text-black"
            }`}
          >
            <UploadCloud size={16} /> Upload CSV / JSON File
          </button>
          <button
            onClick={() => setActiveTab("paste")}
            className={`px-6 py-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "paste" ? "border-black text-black bg-white" : "border-transparent text-gray-500 hover:text-black"
            }`}
          >
            <FileText size={16} /> Paste Raw Text / Data
          </button>
        </div>

        <div className="p-6">
          {activeTab === "file" ? (
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-black transition-colors bg-gray-50/40">
              <UploadCloud size={40} className="mx-auto text-black mb-3" />
              <p className="text-sm font-bold text-black">Choose a CSV or JSON file to upload</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">Supports UTF-8 CSV with headers, or JSON array format</p>
              <label className="mt-4 inline-block bg-black hover:bg-gray-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer shadow-sm transition-all">
                Browse File
                <input
                  type="file"
                  accept=".csv,.json"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste your CSV with headers or JSON array here..."
                rows={8}
                className="w-full border border-gray-200 rounded-xl p-3.5 font-mono text-xs bg-gray-50 focus:bg-white text-black outline-none"
              />
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-gray-400 font-medium">
                  Tip: Ensure headers include brand, model, price, storage, conditionGrade
                </span>
                <button
                  type="button"
                  onClick={handlePasteParse}
                  className="bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  Parse & Preview Data
                </button>
              </div>
            </div>
          )}

          {parsingError && (
            <div className="mt-4 p-3 bg-gray-100 text-black rounded-xl border border-gray-300 text-xs flex items-center gap-2 font-medium">
              <AlertCircle size={16} className="text-gray-700" />
              {parsingError}
            </div>
          )}
        </div>
      </div>

      {/* PREVIEW TABLE */}
      {parsedItems.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-base text-black flex items-center gap-2">
                <Layers size={18} className="text-black" />
                Parsed Catalog Preview ({parsedItems.length} Products Ready)
              </h3>
              <p className="text-xs text-gray-500 font-medium">Review the items before pushing to live production database</p>
            </div>
            <button
              onClick={() => setParsedItems([])}
              className="text-xs text-gray-600 hover:text-black font-bold flex items-center gap-1"
            >
              <Trash2 size={14} /> Clear Preview
            </button>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase font-bold text-[10px] tracking-wider sticky top-0 border-b border-gray-200">
                <tr>
                  <th className="p-3 pl-5">#</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Brand & Model</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">MRP</th>
                  <th className="p-3">Specs</th>
                  <th className="p-3">Condition</th>
                  <th className="p-3 pr-5">City</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {parsedItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/60">
                    <td className="p-3 pl-5 text-gray-400 font-mono text-[11px]">{idx + 1}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 border border-gray-300 uppercase text-[9px] font-bold">
                        {item.listingType || "device"}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-black">
                      {item.brand} {item.model}
                    </td>
                    <td className="p-3 font-black text-black">
                      ₹{Number(item.price || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="p-3 text-gray-400">
                      {item.originalPrice ? `₹${Number(item.originalPrice).toLocaleString("en-IN")}` : "—"}
                    </td>
                    <td className="p-3 text-gray-600 font-medium">
                      {item.storage || item.ram ? `${item.storage || ""} / ${item.ram || ""}` : (item.partCategory || "—")}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                        {item.conditionGrade || "Good"}
                      </span>
                    </td>
                    <td className="p-3 pr-5 text-gray-500">
                      {item.city || "Pan India"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
            <button
              onClick={handleBulkSubmit}
              disabled={loading}
              className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
              {loading ? "Publishing to Shared Database..." : `Import & Publish ${parsedItems.length} Products`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
