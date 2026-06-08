import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCode2,
  Terminal,
  ChevronRight,
  BookOpen,
  ArrowLeft,
  Copy,
  Check,
  Download
} from 'lucide-react';
import { Badge } from '../components/ui/Badge.js';
import ROUTES from '../constants/routes.js';
import { cn } from '../lib/utils.js';

type Language = 'curl' | 'js' | 'python' | 'php';

export const Docs: React.FC = () => {
  const [activeLang, setActiveLang] = useState<Language>('curl');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const codeTemplates = {
    createOrder: {
      curl: `curl -X POST https://jzpay.shop/v1/order/create \\
  -H "X-API-Key: your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "partner_order_id": "MG-12345",
    "product_id": "215570",
    "category_id": "50",
    "quantity": 1,
    "fields": {
      "User ID": "12314123",
      "Server": "3402"
    }
  }'`,
      js: `const response = await fetch('https://jzpay.shop/v1/order/create', {
  method: 'POST',
  headers: {
    'X-API-Key': 'your_api_key_here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    partner_order_id: 'MG-12345',
    product_id: '215570',
    category_id: '50',
    quantity: 1,
    fields: {
      'User ID': '12314123',
      'Server': '3402'
    }
  })
});
const data = await response.json();
console.log(data);`,
      python: `import requests

url = "https://jzpay.shop/v1/order/create"
headers = {
    "X-API-Key": "your_api_key_here",
    "Content-Type": "application/json"
}
payload = {
    "partner_order_id": "MG-12345",
    "product_id": "215570",
    "category_id": "50",
    "quantity": 1,
    "fields": {
        "User ID": "12314123",
        "Server": "3402"
    }
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`,
      php: `<?php

$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "https://jzpay.shop/v1/order/create",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => "POST",
  CURLOPT_POSTFIELDS => json_encode([
    "partner_order_id" => "MG-12345",
    "product_id" => "215570",
    "category_id" => "50",
    "quantity" => 1,
    "fields" => [
      "User ID" => "12314123",
      "Server" => "3402"
    ]
  ]),
  CURLOPT_HTTPHEADER => [
    "Content-Type: application/json",
    "X-API-Key: your_api_key_here"
  ],
]);

$response = curl_exec($curl);
curl_close($curl);
echo $response;`
    },
    getOrder: {
      curl: `curl -X GET https://jzpay.shop/v1/order/c9281a94-82a1-432d-9b51-78facb21 \\
  -H "X-API-Key: your_api_key_here"`,
      js: `const response = await fetch('https://jzpay.shop/v1/order/c9281a94-82a1-432d-9b51-78facb21', {
  headers: {
    'X-API-Key': 'your_api_key_here'
  }
});
const data = await response.json();
console.log(data);`,
      python: `import requests

url = "https://jzpay.shop/v1/order/c9281a94-82a1-432d-9b51-78facb21"
headers = {
    "X-API-Key": "your_api_key_here"
}

response = requests.get(url, headers=headers)
print(response.json())`,
      php: `<?php

$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "https://jzpay.shop/v1/order/c9281a94-82a1-432d-9b51-78facb21",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER => [
    "X-API-Key: your_api_key_here"
  ],
]);

$response = curl_exec($curl);
curl_close($curl);
echo $response;`
    },
    getBalance: {
      curl: `curl -X GET https://jzpay.shop/v1/balance \\
  -H "X-API-Key: your_api_key_here"`,
      js: `const response = await fetch('https://jzpay.shop/v1/balance', {
  headers: {
    'X-API-Key': 'your_api_key_here'
  }
});
const data = await response.json();
console.log(data);`,
      python: `import requests

url = "https://jzpay.shop/v1/balance"
headers = {
    "X-API-Key": "your_api_key_here"
}

response = requests.get(url, headers=headers)
print(response.json())`,
      php: `<?php

$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "https://jzpay.shop/v1/balance",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER => [
    "X-API-Key: your_api_key_here"
  ],
]);

$response = curl_exec($curl);
curl_close($curl);
echo $response;`
    }
  };

  const errorCodes = [
    { code: "109", desc: "Invalid Signature headers sent." },
    { code: "111", desc: "Insufficient Balance in JZPay wallet." },
    { code: "114", desc: "Target Product is currently Out of Stock." },
    { code: "403", desc: "Invalid JZPay API credentials or unauthorized account scope." },
    { code: "420", desc: "Duplicate partner order ID provided. Order has already been submitted." },
    { code: "433", desc: "IP address not allowed by JZPay firewall settings." },
    { code: "RATE_LIMIT_EXCEEDED", desc: "Rate limit threshold breached. Max 100 calls per minute." }
  ];

  return (
    <div className="bg-[#0a0a0f] text-gray-300 min-h-screen flex flex-col font-sans select-text">
      {/* Top Navbar */}
      <header className="h-16 border-b border-dark-border bg-dark-surface/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 select-none">
        <div className="flex items-center gap-3">
          <Link to={ROUTES.LANDING} className="p-1 rounded bg-dark-surface hover:bg-dark-bg/60 border border-dark-border text-gray-400 hover:text-gray-200 transition-colors">
            <ArrowLeft className="w-4.5 h-4.5" />
          </Link>
          <span className="font-extrabold text-sm text-gray-200 tracking-wider">jzpay API Reference</span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="/openapi.yaml"
            download="openapi.yaml"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-btn bg-dark-surface border border-dark-border hover:border-brand/40 text-xs font-semibold text-gray-300 hover:text-gray-100 transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            Download OpenAPI Spec
          </a>
          <Link to={ROUTES.DASHBOARD.OVERVIEW} className="text-xs font-semibold text-brand hover:underline">
            Go to Console &rarr;
          </Link>
        </div>
      </header>

      {/* Main split dashboard view */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Documentation Index sidebar */}
        <aside className="w-64 border-r border-dark-border bg-dark-surface/10 hidden md:block overflow-y-auto p-6 text-left select-none">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">GETTING STARTED</span>
              <a href="#quickstart" className="text-sm text-gray-300 hover:text-brand font-semibold">Quickstart Integration</a>
              <a href="#auth" className="text-sm text-gray-300 hover:text-brand font-semibold">Authentication Scopes</a>
            </div>

            <div className="flex flex-col gap-2.5 border-t border-dark-border/40 pt-5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">GATEWAY API ENDPOINTS</span>
              <a href="#create-order" className="text-sm text-gray-300 hover:text-brand font-semibold flex items-center gap-2">
                <Badge variant="success" className="px-1 py-0 text-[9px]">POST</Badge>
                Create Order
              </a>
              <a href="#get-order" className="text-sm text-gray-300 hover:text-brand font-semibold flex items-center gap-2">
                <Badge variant="info" className="px-1 py-0 text-[9px]">GET</Badge>
                Get Order
              </a>
              <a href="#get-balance" className="text-sm text-gray-300 hover:text-brand font-semibold flex items-center gap-2">
                <Badge variant="info" className="px-1 py-0 text-[9px]">GET</Badge>
                Get Balance
              </a>
              <a href="#list-products" className="text-sm text-gray-300 hover:text-brand font-semibold flex items-center gap-2">
                <Badge variant="info" className="px-1 py-0 text-[9px]">GET</Badge>
                List Products
              </a>
            </div>

            <div className="flex flex-col gap-2.5 border-t border-dark-border/40 pt-5">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">ERROR REFERENCE</span>
              <a href="#error-codes" className="text-sm text-gray-300 hover:text-brand font-semibold">Error Status Map</a>
            </div>
          </div>
        </aside>

        {/* Center/Right docs contents */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto">
          {/* Documentation instructions (Center panel) */}
          <div className="flex-1 px-6 md:px-12 py-10 max-w-4xl text-left flex flex-col gap-12 border-r border-dark-border/40">
            {/* Quickstart */}
            <section id="quickstart" className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-brand" />
                Quickstart Integration
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Connect your top-up pipelines in minutes using four straightforward steps:
              </p>
              <ol className="flex flex-col gap-3 text-sm text-gray-400 pl-4 list-decimal mt-2">
                <li>Register a platform account credentials on the landing dashboard console.</li>
                <li>Add valid JZPay Partner ID and Secret Keys in the Credentials panel.</li>
                <li>Generate a gateway API Key to retrieve access for UAT/Production testing.</li>
                <li>Send HTTP order placement payloads to the gateway endpoint using your key.</li>
              </ol>
            </section>

            {/* Auth */}
            <section id="auth" className="flex flex-col gap-4 border-t border-dark-border/30 pt-10">
              <h2 className="text-xl font-bold text-gray-100">Authentication Header</h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                All proxy requests sent to the jzpay API require authorization. You must supply your token key inside the <code className="bg-dark-bg/60 border border-dark-border px-1.5 py-0.5 rounded font-mono text-xs text-indigo-300">X-API-Key</code> request header:
              </p>
              <pre className="p-4 bg-dark-bg/60 border border-dark-border rounded-card font-mono text-xs text-gray-400 leading-relaxed">
                <code>X-API-Key: mg_live_your_platform_token_key</code>
              </pre>
            </section>

            {/* Create Order Endpoint */}
            <section id="create-order" className="flex flex-col gap-6 border-t border-dark-border/30 pt-10">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Badge variant="success">POST</Badge>
                  <code className="text-sm font-mono font-bold text-gray-100">/v1/order/create</code>
                </div>
                <h3 className="text-lg font-bold text-gray-200 mt-2">Create top-up Order</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Triggers an order process in the gateway queue. Orders are processed asynchronously in the background. The gateway returns a `jobId` and a pending `orderId`. Once JZPay fulfills the request, a webhook is fired to notify your systems.
                </p>
              </div>

              {/* Request Parameters */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest select-none">Request Parameters</h4>
                <div className="overflow-x-auto border border-dark-border rounded-card bg-dark-surface/10">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-dark-border text-gray-500 font-semibold select-none bg-dark-bg/25">
                        <th className="p-3">Field</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Required</th>
                        <th className="p-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border">
                      <tr>
                        <td className="p-3 font-mono font-bold text-indigo-300">partner_order_id</td>
                        <td className="p-3 font-mono text-gray-400">string</td>
                        <td className="p-3 text-amber-500 font-semibold">Optional</td>
                        <td className="p-3 text-gray-400">Your custom unique transaction ID for tracking idempotency.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-indigo-300">product_id</td>
                        <td className="p-3 font-mono text-gray-400">string</td>
                        <td className="p-3 text-brand font-semibold">Required</td>
                        <td className="p-3 text-gray-400">JZPay Variation ID of the product variation to purchase.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-indigo-300">quantity</td>
                        <td className="p-3 font-mono text-gray-400">integer</td>
                        <td className="p-3 text-amber-500 font-semibold">Optional</td>
                        <td className="p-3 text-gray-400">The quantity of top-ups (max 10). Defaults to 1.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-indigo-300">fields</td>
                        <td className="p-3 font-mono text-gray-400">object</td>
                        <td className="p-3 text-brand font-semibold">Required</td>
                        <td className="p-3 text-gray-400">Product-specific custom arguments (e.g. "User ID", "Server").</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Get Order Endpoint */}
            <section id="get-order" className="flex flex-col gap-6 border-t border-dark-border/30 pt-10">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Badge variant="info">GET</Badge>
                  <code className="text-sm font-mono font-bold text-gray-100">/v1/order/:orderId</code>
                </div>
                <h3 className="text-lg font-bold text-gray-200 mt-2">Get Order Details</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Fetches full database logs and status information for a specific order by supplying the platform order ID.
                </p>
                
                <div className="flex items-center gap-3 mt-4">
                  <Badge variant="info">GET</Badge>
                  <code className="text-sm font-mono font-bold text-gray-100">/v1/order/by-partner/:partnerOrderId</code>
                </div>
                <h3 className="text-lg font-bold text-gray-200 mt-2">Get Order by Partner ID</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Retrieve transaction logs using your custom `partner_order_id` that you set during order creation.
                </p>
              </div>
            </section>

            {/* Get Balance Endpoint */}
            <section id="get-balance" className="flex flex-col gap-6 border-t border-dark-border/30 pt-10">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Badge variant="info">GET</Badge>
                  <code className="text-sm font-mono font-bold text-gray-100">/v1/balance</code>
                </div>
                <h3 className="text-lg font-bold text-gray-200 mt-2">Get Account Balance</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Queries your current partner wallet balance and currency configuration based on your API key's active environment (UAT or Production).
                </p>
              </div>
            </section>

            {/* List Products Endpoint */}
            <section id="list-products" className="flex flex-col gap-6 border-t border-dark-border/30 pt-10">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Badge variant="info">GET</Badge>
                  <code className="text-sm font-mono font-bold text-gray-100">/v1/products</code>
                </div>
                <h3 className="text-lg font-bold text-gray-200 mt-2">List Catalog Products</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Query the active top-up catalog. You can optionally filter results by query parameter <code className="bg-dark-bg/60 border border-dark-border px-1.5 py-0.5 rounded font-mono text-xs text-indigo-300">category_id</code> (defaults to "50").
                </p>

                <div className="flex items-center gap-3 mt-4">
                  <Badge variant="info">GET</Badge>
                  <code className="text-sm font-mono font-bold text-gray-100">/v1/categories</code>
                </div>
                <h3 className="text-lg font-bold text-gray-200 mt-2">List Product Categories</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Retrieve all product category names and IDs currently supported in the system.
                </p>
              </div>
            </section>

            {/* Error Codes Table */}
            <section id="error-codes" className="flex flex-col gap-4 border-t border-dark-border/30 pt-10">
              <h2 className="text-xl font-bold text-gray-100">Error Status Mappings</h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                JZPay errors are converted and returned by JZGateway with structured JSON details. Below are the common error codes mapping:
              </p>
              <div className="overflow-x-auto border border-dark-border rounded-card mt-2">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-dark-border text-gray-500 font-semibold bg-dark-bg/25 select-none">
                      <th className="p-3">Error Code</th>
                      <th className="p-3">Description Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border font-medium select-text">
                    {errorCodes.map((err) => (
                      <tr key={err.code}>
                        <td className="p-3 font-mono font-bold text-rose-400">{err.code}</td>
                        <td className="p-3 text-gray-400 leading-relaxed">{err.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Interactive Code console panel (Right panel) */}
          <div className="w-full lg:w-[450px] xl:w-[500px] bg-[#0d0d12] border-l border-dark-border p-6 flex flex-col gap-6 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto text-left select-none">
            {/* Header selector */}
            <div className="flex items-center justify-between border-b border-dark-border/40 pb-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Code Examples</span>
              
              {/* Tabs */}
              <div className="flex bg-dark-surface/60 border border-dark-border p-0.5 rounded-btn text-xs font-semibold">
                {(['curl', 'js', 'python', 'php'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(lang)}
                    className={cn("px-2.5 py-1.5 rounded transition-all", {
                      "bg-[#0a0a0f] text-indigo-300 font-bold": activeLang === lang,
                      "text-gray-500 hover:text-gray-300": activeLang !== lang
                    })}
                  >
                    {lang === 'js' ? 'Fetch' : lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Display Code console */}
            <div className="flex flex-col gap-2 flex-1 justify-start">
              {/* Example block 1 */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Create Order Payload</span>
                  <button
                    onClick={() => handleCopyCode('create', codeTemplates.createOrder[activeLang])}
                    className="p-1 rounded hover:bg-dark-surface text-gray-500 hover:text-gray-300 flex items-center gap-1 text-[10px] font-semibold border border-transparent hover:border-dark-border transition-all"
                  >
                    {copiedId === 'create' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId === 'create' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="p-4 rounded-card bg-[#07070b] border border-dark-border/60 text-xs font-mono text-indigo-300 overflow-x-auto leading-relaxed max-h-80 select-text">
                  <code>{codeTemplates.createOrder[activeLang]}</code>
                </pre>
              </div>

              {/* Example block 2 */}
              <div className="flex flex-col gap-2 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Get Order Payload</span>
                  <button
                    onClick={() => handleCopyCode('get', codeTemplates.getOrder[activeLang])}
                    className="p-1 rounded hover:bg-dark-surface text-gray-500 hover:text-gray-300 flex items-center gap-1 text-[10px] font-semibold border border-transparent hover:border-dark-border transition-all"
                  >
                    {copiedId === 'get' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId === 'get' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="p-4 rounded-card bg-[#07070b] border border-dark-border/60 text-xs font-mono text-indigo-300 overflow-x-auto leading-relaxed select-text">
                  <code>{codeTemplates.getOrder[activeLang]}</code>
                </pre>
              </div>

              {/* Example block 3 */}
              <div className="flex flex-col gap-2 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Get Balance Payload</span>
                  <button
                    onClick={() => handleCopyCode('balance', codeTemplates.getBalance[activeLang])}
                    className="p-1 rounded hover:bg-dark-surface text-gray-500 hover:text-gray-300 flex items-center gap-1 text-[10px] font-semibold border border-transparent hover:border-dark-border transition-all"
                  >
                    {copiedId === 'balance' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId === 'balance' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="p-4 rounded-card bg-[#07070b] border border-dark-border/60 text-xs font-mono text-indigo-300 overflow-x-auto leading-relaxed select-text">
                  <code>{codeTemplates.getBalance[activeLang]}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Docs;
