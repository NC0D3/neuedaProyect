
const input = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

const userId = localStorage.getItem('userId');
const user = JSON.parse(localStorage.getItem('user') || '{}');
document.getElementById('user_money').textContent = "Tu dinero: $" + user.cashBalance;

console.log(userId);
let portfolioVisible = false;
let portfolioCharts = {};

if (!userId) {
    window.location.href = 'login.html';
}


async function cargarBusquedaStock(valor = "") {
    try {
        const searchContainer = document.getElementById("searchContainer");
        const res = (valor != "" || valor == null) ? await fetch(`/API/market/stock?search=${valor}`) : await fetch('/API/market/stock?search=p&g');
        const data = await res.json();
        console.log(data)
        searchContainer.innerHTML = "";
        for (const item of data) {
            const container = document.createElement("div");
            container.className = "stock-container";
            try {
                const resPrice = await fetch(`/API/market/stock-price/${item.symbol}`);
                const dataPrice = await resPrice.json();
                container.innerHTML = `
                <div class="stock-info">
                    <h2 id="name_${item.symbol}">${item.description}</h2>
                    <p><b>${item.symbol}</b></p>
                    <p id="price_${item.symbol}">$${dataPrice.c} &nbsp;&nbsp; %${dataPrice.dp}</p>
                </div>

                <div class="stock-actions">
                    <input type="number" step="0.01" value="1" id="amount_${item.symbol}">
                    <div class="stock-total" id="total_${item.symbol}">$${dataPrice.c.toFixed(2)}</div>
                    <button onclick="buyStock('${item.symbol}')">Buy</button>
                    <button onclick="sellStock('${item.symbol}')">Sell</button>
                </div>
            `;

                const inputAmount = container.querySelector(`#amount_${item.symbol}`);
                const totalDiv = container.querySelector(`#total_${item.symbol}`);
                inputAmount.addEventListener("input", () => {
                    const cantidad = parseFloat(inputAmount.value) || 0;
                    totalDiv.textContent = "$" + (cantidad * dataPrice.c).toFixed(2);
                });

            } catch (err) {
                container.innerHTML = `
            <h3>${item.description}</h3>
            <p>Symbol: ${item.symbol}</p>
            <p style="color:red;">Error fetching price</p>
        `;
                console.error(`Error fetching price for ${item.symbol}:`, err);
            }

            // redirección al dar clic en toda la card (excepto botones/inputs)
            container.addEventListener("click", (e) => {
                if (e.target.tagName !== "BUTTON" && e.target.tagName !== "INPUT") {
                    irAStock(item.symbol);
                }
            });

            searchContainer.appendChild(container);
        }
    } catch (err) {
        console.log(err);
    }
}

// Buscar al presionar ENTER
input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const value = input.value.trim();
        if (value) cargarBusquedaStock(value);
    }
});

// Buscar al dar clic en la lupa
searchBtn.addEventListener('click', () => {
    const value = input.value.trim();
    if (value) cargarBusquedaStock(value);
});

// Funciones de acciones
function irAStock(symbol) {
    window.location.href = `stock.html?symbol=${symbol}`;
}

async function buyStock(symbol) {
    const total = parseFloat(document.getElementById(`total_${symbol}`).innerText.replace("$", ""));
    const price = parseFloat(document.getElementById(`price_${symbol}`).innerText.replace("$", ""));
    const name = document.getElementById(`name_${symbol}`).innerText;
    const now = new Date();
    const formatDate = now.toISOString().slice(0, 19).replace('T', ' ');
    if (total > user.cashBalance) {
        alert('You don\'t have enough money');
    } else {
        user.cashBalance -= total;
        localStorage.setItem('user', JSON.stringify(user));
        document.getElementById('user_money').textContent = "Tu dinero: $" + user.cashBalance;
        const buy = {
            user_ID: userId,
            symbol: symbol,
            name: name,
            amount: document.getElementById(`amount_${symbol}`).value,
            price: price,
            date: formatDate,
            new_money: user.cashBalance
        }
        const response = await fetch('/API/market/stock-buy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(buy)
        });
        const result = await response.json();
        if (result.success) {
            alert(result.message)
        }

    }
    //alert(`BUY ${amount} of ${symbol}`);
    // aquí puedes hacer fetch a tu API
}

function sellStock(symbol) {
    const amount = document.getElementById(`amount_${symbol}`).value;
    alert(`SELL ${amount} of ${symbol}`);
    // aquí puedes hacer fetch a tu API
}

window.onload = function () { cargarBusquedaStock() };

