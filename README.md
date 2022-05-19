# AliExpress Invoice Generator Script

Accounting in many countries requires invoices or receipts for purchases. However, AliExpress does not provide a way to generate an invoice for orders. This can be a problem for people who need to account for their AliExpress purchases.

The AliExpress Invoice Generator is a script that generates an invoice for an AliExpress order.  It includes the order number, the date of the order, the products purchased, the prices, the shipping cost, and the total cost. It also includes your contact details taken from the AliExpress account.

The provided `.js` file is to be used with the TamperMonkey Chrome extension. Once installed, it'll show a 'Generate Invoice' button on every AliExpress order detail page that, when clicked, will open a new tab with the printable invoice that can be saved as PDF or printed.

# Installation Instructions

1. Install the [TamperMonkey](https://tampermonkey.net/) extension for Chrome.
2. Navigate to the [AliExpress Invoice Generator](https://github.com/gyohng/aliexpress-invoice-generator/raw/main/aliexpress-invoice-tampermonkey.user.js) script raw page.
3. TamperMonkey will ask if you want to install the script. Click 'Install'.

# Usage Instructions

1. Go to an [AliExpress Orders Page](https://www.aliexpress.com/p/order/index.html).
2. Click 'Order Details' next to the order you would like to generate an invoice for.
3. Click the 'Generate Invoice' button.
4. A new tab will open with the invoice.
5. Save the invoice as PDF or print it.

# Note

Some logic in the script relies on the current AliExpress site language. The script has currently only been tested for the English version of the site.
