# JZGateway (GoldBridge) API - PHP Integration Guide

Welcome to the **JZGateway** integration guide for PHP. This document provides step-by-step instructions, standard code snippets, and a reusable PHP integration class to help you connect your PHP-based website or e-commerce system to the API gateway.

---

## Table of Contents
1. [Prerequisites & Authentication](#1-prerequisites--authentication)
2. [Base URL Configurations](#2-base-url-configurations)
3. [JZGateway PHP Helper Class](#3-jzpay-php-helper-class)
4. [Endpoint Examples](#4-endpoint-examples)
   - [Retrieve Product Categories](#retrieve-product-categories)
   - [Retrieve Product Catalog](#retrieve-product-catalog)
   - [Retrieve Account Balance](#retrieve-account-balance)
   - [Place a Top-up Order](#place-a-top-up-order)
   - [Query Order Status](#query-order-status)
5. [Handling Webhooks & Signature Verification](#5-handling-webhooks--signature-verification)
6. [Best Practices](#6-best-practices)

---

## 1. Prerequisites & Authentication

All API requests sent to the JZGateway must be authenticated using your platform API Key. You must include this key in the request headers:

```http
X-API-Key: your_api_key_here
Content-Type: application/json
```

To generate an API key:
1. Log into your dashboard portal.
2. Ensure you have added valid credentials (e.g., JZPay credentials) for either your **UAT** or **Production** environment.
3. Navigate to **API Keys** and generate a new key for the desired environment.

---

## 2. Base URL Configurations

Depending on your environment, define your Base URL accordingly:

*   **Local Development / Docker:** `http://localhost:3000/v1`
*   **Production API Server:** `https://jzpay.shop/v1` (replace with your domain)

---

## 3. JZGateway PHP Helper Class

To make integration fast and clean, you can use the following lightweight PHP helper class. It manages standard cURL options, headers, and request formatting.

Create a file named `JZGatewayClient.php` or paste this directly into your project:

```php
<?php

class JZGatewayClient {
    private $apiKey;
    private $baseUrl;

    /**
     * Initialize the JZGateway Client.
     * 
     * @param string $apiKey The platform API Key.
     * @param string $baseUrl The API Gateway Base URL.
     */
    public function __construct(string $apiKey, string $baseUrl = 'http://localhost:3000/v1') {
        $this->apiKey = $apiKey;
        $this->baseUrl = rtrim($baseUrl, '/');
    }

    /**
     * Send an HTTP request to the Gateway.
     */
    private function sendRequest(string $path, string $method = 'GET', array $data = []) {
        $url = $this->baseUrl . '/' . ltrim($path, '/');
        $curl = curl_init();

        $headers = [
            'Content-Type: application/json',
            'X-API-Key: ' . $this->apiKey
        ];

        $options = [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_HTTPHEADER => $headers,
        ];

        if ($method === 'POST' || $method === 'PUT') {
            $options[CURLOPT_POSTFIELDS] = json_encode($data);
        }

        curl_setopt_array($curl, $options);

        $response = curl_exec($curl);
        $err = curl_error($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

        curl_close($curl);

        if ($err) {
            return [
                'success' => false,
                'error' => 'cURL Error: ' . $err,
                'http_code' => $httpCode
            ];
        }

        $decodedResponse = json_decode($response, true);

        return [
            'success' => $httpCode >= 200 && $httpCode < 300,
            'http_code' => $httpCode,
            'data' => $decodedResponse !== null ? $decodedResponse : $response
        ];
    }

    /**
     * Get all active product categories.
     */
    public function getCategories() {
        return $this->sendRequest('categories', 'GET');
    }

    /**
     * Get products filtered by category ID.
     * 
     * @param int|string $categoryId Default is 50.
     */
    public function getProducts($categoryId = 50) {
        return $this->sendRequest('products?category_id=' . urlencode($categoryId), 'GET');
    }

    /**
     * Get detailed information for a specific product variation.
     */
    public function getProductDetail($productId) {
        return $this->sendRequest('products/' . urlencode($productId), 'GET');
    }

    /**
     * Submit/Queue a top-up or eVoucher order.
     * 
     * @param string $productId The JZPay variation ID.
     * @param array $fields Custom form input values required (e.g. ['User ID' => '12345', 'Server' => 'Asia']).
     * @param string|null $partnerOrderId Optional unique transaction ID from your website for tracking and idempotency.
     * @param int $quantity Amount of items to purchase (default 1).
     * @param string|null $categoryId Category identifier ('Direct Top Up' or 'eVouchers').
     */
    public function createOrder(string $productId, array $fields, ?string $partnerOrderId = null, int $quantity = 1, ?string $categoryId = null) {
        $payload = [
            'product_id' => $productId,
            'quantity' => $quantity,
            'fields' => $fields
        ];

        if ($partnerOrderId !== null) {
            $payload['partner_order_id'] = $partnerOrderId;
        }

        if ($categoryId !== null) {
            $payload['category_id'] = $categoryId;
        }

        return $this->sendRequest('order/create', 'POST', $payload);
    }

    /**
     * Get transaction log details using the JZGateway internal order ID.
     */
    public function getOrder(string $orderId) {
        return $this->sendRequest('order/' . urlencode($orderId), 'GET');
    }

    /**
     * Retrieve transaction log details using your website's custom partner order ID.
     */
    public function getOrderByPartner(string $partnerOrderId) {
        return $this->sendRequest('order/by-partner/' . urlencode($partnerOrderId), 'GET');
    }

    /**
     * Retrieve current partner wallet balance and currency configuration.
     */
    public function getBalance() {
        return $this->sendRequest('balance', 'GET');
    }
}
?>
```

---

## 4. Endpoint Examples

Below are standard examples demonstrating how to use the helper client in your PHP applications.

### Instantiate the Client
```php
require_once 'JZGatewayClient.php';

$apiKey = 'mg_live_your_platform_token_key';
$gateway = new JZGatewayClient($apiKey, 'http://localhost:3000/v1');
```

### Retrieve Product Categories
```php
$response = $gateway->getCategories();
if ($response['success']) {
    print_r($response['data']['categories']);
} else {
    echo "Failed to load categories: Code " . $response['http_code'];
}
```

### Retrieve Product Catalog
```php
// Query products belonging to category '50'
$response = $gateway->getProducts(50);
if ($response['success']) {
    print_r($response['data']['products']);
} else {
    echo "Failed to retrieve products.";
}
```

### Retrieve Account Balance
```php
$response = $gateway->getBalance();
if ($response['success']) {
    echo "Current Balance: " . $response['data']['balance'] . " " . $response['data']['currency'];
} else {
    echo "Failed to retrieve balance.";
}
```

### Place a Top-up Order
When submitting an order, the request runs **asynchronously**. The gateway will return a job status indicating that it has been queued. You will receive the actual transaction response via your configured Webhook.
```php
$productId = '215570'; // Target product variation ID
$partnerOrderId = 'MY-SHOP-ORDER-99182'; // Unique ID for tracking
$fields = [
    'User ID' => '518293041',
    'Server' => '3402'
];

$response = $gateway->createOrder($productId, $fields, $partnerOrderId, 1);
if ($response['success']) {
    $jobId = $response['data']['jobId'];
    $orderId = $response['data']['orderId'];
    echo "Order queued successfully. Gateway Order ID: " . $orderId;
} else {
    echo "Order failed: " . json_encode($response['data']);
}
```

### Query Order Status
If you want to manually pull the status of an order instead of waiting for a webhook:
```php
// By Gateway Order ID
$response = $gateway->getOrder('order-uuid-here');

// By Partner Order ID
$response = $gateway->getOrderByPartner('MY-SHOP-ORDER-99182');

if ($response['success']) {
    $order = $response['data']['order'];
    echo "Order status is: " . $order['status'];
}
```

---

## 5. Handling Webhooks & Signature Verification

Because order fulfillment happens in the background, you must configure a Webhook URL in your dashboard. When order processing changes state (e.g., `completed`, `refunded`), the gateway will send a `POST` request to your webhook URL.

### Security Signature
Every webhook payload is signed with a SHA256 HMAC header `X-GoldBridge-Signature`, generated using your webhook's unique **Signing Secret**. You **must** verify this signature to guarantee authenticity.

### Webhook PHP Endpoint Code (`webhook.php`)

```php
<?php

// Retrieve your Webhook Signing Secret from your dashboard config
$signingSecret = 'your_webhook_signing_secret_here';

// 1. Capture the signature from headers
$headers = getallheaders();
$receivedSignature = isset($headers['X-GoldBridge-Signature']) ? $headers['X-GoldBridge-Signature'] : '';

if (empty($receivedSignature)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing signature header']);
    exit();
}

// 2. Read the raw POST request body
$rawPayload = file_get_contents('php://input');

// 3. Compute local HMAC SHA256 signature
$computedSignature = hash_hmac('sha256', $rawPayload, $signingSecret);

// 4. Validate signature securely
if (!hash_equals($computedSignature, $receivedSignature)) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid webhook signature']);
    exit();
}

// 5. Decode payload
$payload = json_decode($rawPayload, true);

// Extract status and metadata
$event = $payload['event']; // e.g. order.completed, order.refunded
$orderId = $payload['order_id'];
$partnerOrderId = $payload['partner_order_id'];
$status = $payload['status'];
$productId = $payload['product_id'];
$quantity = $payload['quantity'];

// TODO: Update your internal database status based on $status
// e.g., if ($status === 'completed') { fulfillOrderInDatabase($partnerOrderId); }

// 6. Return 200 OK to the gateway so it knows the webhook was handled successfully
http_response_code(200);
echo json_encode(['status' => 'success']);
?>
```

---

## 6. Best Practices

1.  **Use Idempotent IDs:** Always populate `partner_order_id` with your internal transaction/order primary keys. This prevents double-purchases in case of connection dropouts.
2.  **Verify Webhook Signatures:** Never process order statuses without verifying the signature headers to prevent malicious spoofing.
3.  **Secure Credentials:** Store your `X-API-Key` and `Signing Secret` in your environment variables (`.env`) rather than committing them in plain text in your repository code.
