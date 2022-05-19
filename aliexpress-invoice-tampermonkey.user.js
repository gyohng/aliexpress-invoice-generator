// ==UserScript==
// @name         Aliexpress Invoice Generator
// @namespace    https://github.com/
// @version      0.3
// @description  Generates invoices from Aliexpress Order Detail pages
// @author       George Yohng
// @match        https://www.aliexpress.com/p/order/detail.html*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=aliexpress.com
// @grant        none
// ==/UserScript==

(function() {

    function htmlEscape(s) {
        return (s
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
        )
    }
    
    function msleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
    
    async function init() {
        let statusContent = document.getElementsByClassName('order-status-content')
        if (statusContent) statusContent = statusContent[0]
        statusContent.innerHTML = `
        <button class="comet-btn" style="float:right;" onclick="extGenerateInvoice()">Generate Invoice</button>
        ` + statusContent.innerHTML
    }
    
    window.addEventListener("load", init)    
    
    function priceByQuantity(price, qty) {
        return (parseFloat(price.replace(/[^0-9.-]+/g,"")) * parseInt(qty) + 0.0001).toFixed(2)
    }

    function beautifyAddress(addr) {
        // a hack to get normalise tautology in some addresses that I'm personally using
        // TODO: make the patterns more generic
        return (addr
            .replace(/Singapore, Singapore, Singapore/, 'Singapore')
            .replace(/Singapore, Singapore/, 'Singapore')
            .replace(/St\.Julian's, St\.Julian's/, "St.Julian's")
            .replace(/---, /, '')
        )
    }

    async function generateInvoice() {
        let moreBtn = document.querySelector("#root div.order-price span.switch-icon")
        if (moreBtn.classList.contains('comet-icon-arrowdown')) {
            moreBtn.click()
        }

        let expandAddrBtn = document.querySelector("#root div.order-detail-info span.switch-icon")
        if (expandAddrBtn.classList.contains('comet-icon-arrowdown')) {
            expandAddrBtn.click()
        }
        
        await msleep(250)
    
        let items = document.getElementsByClassName('order-detail-item-content')
        let itemTable = ''
            itemTable += '<tr>'
            itemTable += '<td class="item-name bb"><b>Item</b></td>'
            itemTable += '<td class="price bb"><b>Unit Price</b></td>'
            itemTable += '<td class="qty bb"><b>Qty</b></td>'
            itemTable += '<td class="price2 bb"><b>Cost</b></td>'
            itemTable += '</tr>'
    
        for (let item of items) {
            itemTable += '<tr>'
            let price = item.querySelector('div.item-price').innerText
            price = price.replace(/US \$/, '$')
            let qty = price.replace(/^.*?x\s*([0-9]+)\s*$/, '$1')
            price = price.replace(/\s*x\s*[0-9]+\s*$/,'')
            if (price.length > 3 && price[price.length-3] == ',') {
                price = price.replace(/\.([0-9][0-9][0-9])/g, '$1')
                price = price.replace(/,/g, '.')
            }
            let curr = price.replace(/[0-9.-]+/g,"")
            itemTable += '<td class="item-name">' + htmlEscape(item.querySelector('div.item-title').innerText) + '</td>'
            itemTable += '<td class="price">' + price + '</td>'
            itemTable += '<td class="qty">' + qty + '</td>'
            itemTable += '<td class="price2">' + curr + priceByQuantity(price, qty) + '</td>'
            itemTable += '</tr>'
        }
    
        let priceItems = document.getElementsByClassName('order-price-item')
        let itemTableTotals = ''
        for (let item of priceItems) {
            let key = item.querySelector('span.left-col').innerText.trim()
            let price = item.querySelector('span.right-col').innerText.trim()
            if (price.length > 3 && price[price.length-3] == ',') {
                price = price.replace(/\.([0-9][0-9][0-9])/g, '$1')
                price = price.replace(/,/g, '.')
            }
    
            itemTableTotals += '<tr>'
            itemTableTotals += '<td class="total-item" colspan="3">' + key + '</td>'
            itemTableTotals += '<td class="total-price">' + price + '</td>'
            itemTableTotals += '</tr>'
        }
    
        itemTableTotals += '<tr>'
        itemTableTotals += '<td class="total-item bb" colspan="3">&nbsp;</td>'
        itemTableTotals += '<td class="total-price bb"></td>'
        itemTableTotals += '</tr>'
    
        let myAddress = ''
        for (let item of document.querySelectorAll('div.order-detail-info-content.expand-info > div')) {
            myAddress += htmlEscape(beautifyAddress(item.innerText)) + '<br/>\n'
        }
    
        let oinfo = ''
        for (let item of document.querySelectorAll('div.order-detail-order-info > div')) {
            oinfo += item.innerText + '\n'
        }

        let lastItem = ''
        let orderDate = ''
        let orderId = ''
        for (let item of oinfo.split('\n')) {
            item = item.trim()
            if (lastItem == 'Order placed on:') {
                orderDate = htmlEscape(item)
            } else if (lastItem == 'Order ID:') {
                orderId = htmlEscape(item)
            }
    
            lastItem = item
        }
    
        let content=`<!DOCTYPE html>
<html lang="en">
<head>
    <style>
    body {
        min-height:290mm;
        width:210mm;
    }
    html {
        box-sizing: border-box;
        background-color: #AAAAAA;
        font-family: Open Sans, Helvetica Neue, sans-serif;
    }
    *, *:before, *:after {
        box-sizing: inherit;
    }
    body {
        padding: 1.6cm;
        margin: 0px;
        margin-left: auto;
        margin-right: auto;
        background-color: white;
    }
    h1 {
        text-align: left;
        margin: 0px; padding: 0px;
        font-size: 1.15cm;
    }
    h3 {
        margin: 0px;
        padding: 0px;
        margin-top: 1cm;
        margin-bottom: 0.2cm;
    }
    @media print {
        html { background-color: white; }
        body { margin: 0px; margin-left: 0px; margin-right: 0px; }
        @page { margin: 0; background-color: white; }
    }
    invoicecode {
        font-family: 'Courier New', Courier, monospace;
        font-size: 0.41cm;
    }

    aliexpress-address, my-address {
        font-size: 0.4cm;
        letter-spacing:0.05em;
    }

    table {
        border-collapse:separate;
        border-spacing:0 0.5cm;
    }

    td {
        vertical-align: top;
    }

    .bb {
        border-bottom: 1px solid #888;
    }

    .item-name,.total-item  {
        padding-right: 1cm;
    }

    .total-item {
        font-weight: bold;
        text-align: right;
    }

    .price {
        white-space: nowrap;
        padding-right: 1cm;
        text-align: right;
    }

    .price2, .total-price {
        white-space: nowrap;
        padding-left: 1cm;
        text-align: right;
    }

    .total-price {
        font-weight: bold;
        padding-left: 0cm;
    }

    .qty {
        white-space: nowrap;
        text-align: center;
    }

    </style>
</head>
<body>
    <script>

    </script>

    <div style="float:right">
        <h1>Invoice</h1>
        ${orderDate}<br/>
        <invoicecode>${orderId}</invoicecode>
    </div>

    <img style="height:1.5cm;display:block;" src="https://ae01.alicdn.com/kf/S46f745032e6e4f3da94f1a3df564f238K/398x92.png"/>
    <aliexpress-address style="color:#888888;">
    699 Wang Shang Road<br/>
    Binjiang District<br/>
    Hangzhou 310052<br/>
    Zhejiang Province<br/>
    China<br/>
    </aliexpress-address>
    <div style="clear:both;"></div>
    <h3>Bill to:</h3>
    <my-address>${myAddress}</my-address>

    <div style="height:1cm;clear:both;"></div>
    <table width="100%" cellspacing="0">${itemTable}${itemTableTotals}
    </table>
</body>
</html>
    `
    
        let invoice = window.open("#invoiceDoc", "_blank", "width=1024,height=768,scrollbars=1")
        invoice.document.write(content)
        invoice.window.focus()
        await msleep(1000) // TODO: fix this, as onLoad doesn't work in popups
        invoice.window.print()
    }
    
    window.extGenerateInvoice = () => { generateInvoice(); }
    
    })();