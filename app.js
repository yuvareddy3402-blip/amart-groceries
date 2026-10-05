const defaultProducts=[
{id:1,name:"Aashirvaad Atta",unit:"5 kg",price:285,cat:"Staples",icon:"🌾"},
{id:2,name:"India Gate Rice",unit:"5 kg",price:390,cat:"Staples",icon:"🍚"},
{id:3,name:"Toor Dal",unit:"1 kg",price:165,cat:"Staples",icon:"🫘"},
{id:4,name:"Sunflower Oil",unit:"1 L",price:145,cat:"Oils",icon:"🫗"},
{id:5,name:"Amul Milk",unit:"1 L",price:68,cat:"Dairy",icon:"🥛"},
{id:6,name:"Amul Curd",unit:"500 g",price:40,cat:"Dairy",icon:"🥣"},
{id:7,name:"Parle-G Biscuits",unit:"800 g",price:80,cat:"Snacks",icon:"🍪"},
{id:8,name:"Tata Salt",unit:"1 kg",price:30,cat:"Staples",icon:"🧂"},
{id:9,name:"Lux Soap",unit:"100 g",price:38,cat:"Personal Care",icon:"🧼"},
{id:10,name:"Surf Excel",unit:"1 kg",price:145,cat:"Household",icon:"🧺"},
{id:11,name:"Tea Powder",unit:"250 g",price:115,cat:"Beverages",icon:"☕"},
{id:12,name:"Coca-Cola",unit:"750 ml",price:45,cat:"Beverages",icon:"🥤"}
];
function getProducts(){return JSON.parse(localStorage.getItem("amart_products")||"null")||defaultProducts}
function saveProducts(p){localStorage.setItem("amart_products",JSON.stringify(p))}
let cart=JSON.parse(localStorage.getItem("amart_cart")||"[]"), activeCat="All";
function money(n){return "₹"+Number(n).toLocaleString("en-IN")}
function categories(){let cats=["All",...new Set(getProducts().map(p=>p.cat))];document.getElementById("categories").innerHTML=cats.map(c=>`<button class="cat ${c===activeCat?"active":""}" onclick="setCat('${c.replace(/'/g,"\\'")}')">${c}</button>`).join("")}
function renderProducts(){let q=(document.getElementById("search")?.value||"").toLowerCase();let ps=getProducts().filter(p=>(activeCat==="All"||p.cat===activeCat)&&(`${p.name} ${p.cat} ${p.unit}`.toLowerCase().includes(q)));let el=document.getElementById("products");if(!el)return;document.getElementById("resultCount").textContent=ps.length+" items";el.innerHTML=ps.map(p=>`<article class="product"><div class="product-img">${p.icon||"🛒"}</div><div class="product-body"><div class="product-name">${p.name}</div><div class="product-meta">${p.unit} • ${p.cat}</div><div class="product-bottom"><span class="price">${money(p.price)}</span><button class="add" onclick="addToCart(${p.id})">+ Add</button></div></div></article>`).join("")||`<p class="muted">No products found. Try another search.</p>`}
function setCat(c){activeCat=c;categories();renderProducts()}
function addToCart(id){let item=cart.find(x=>x.id===id);if(item)item.qty++;else cart.push({id,qty:1});persistCart();showToast("Added to cart")}
function persistCart(){localStorage.setItem("amart_cart",JSON.stringify(cart));renderCart()}
function renderCart(){let count=cart.reduce((s,x)=>s+x.qty,0);let cb=document.getElementById("cartCount");if(cb)cb.textContent=count;let box=document.getElementById("cartItems");if(!box)return;let products=getProducts();let total=0;box.innerHTML=cart.length?cart.map(x=>{let p=products.find(y=>y.id===x.id);if(!p)return"";total+=p.price*x.qty;return `<div class="cart-row"><div><strong>${p.name}</strong><span class="muted">${money(p.price)} × ${x.qty}</span></div><div class="qty"><button onclick="changeQty(${x.id},-1)">−</button> <b>${x.qty}</b> <button onclick="changeQty(${x.id},1)">+</button></div></div>`}).join(""):`<p class="muted">Your cart is empty.</p>`;document.getElementById("cartTotal").textContent=money(total);document.getElementById("checkoutBtn").disabled=!cart.length}
function changeQty(id,d){let x=cart.find(i=>i.id===id);if(!x)return;x.qty+=d;if(x.qty<=0)cart=cart.filter(i=>i.id!==id);persistCart()}
function openCart(){document.getElementById("cartDrawer").classList.remove("hidden");renderCart()}
function closeCart(){document.getElementById("cartDrawer").classList.add("hidden")}
function openCheckout(){if(!cart.length)return;closeCart();document.getElementById("checkoutModal").classList.remove("hidden")}
function closeCheckout(){document.getElementById("checkoutModal").classList.add("hidden")}
function showToast(t){let e=document.getElementById("success");if(!e)return;e.textContent=t;e.classList.remove("hidden");setTimeout(()=>e.classList.add("hidden"),2400)}
document.getElementById("cartButton")?.addEventListener("click",openCart);
document.getElementById("checkoutBtn")?.addEventListener("click",openCheckout);
document.getElementById("search")?.addEventListener("input",renderProducts);
document.getElementById("orderForm")?.addEventListener("submit",e=>{e.preventDefault();let f=new FormData(e.target),products=getProducts();let items=cart.map(x=>{let p=products.find(y=>y.id===x.id);return {name:p.name,qty:x.qty,price:p.price}});let total=items.reduce((s,x)=>s+x.price*x.qty,0);let orders=JSON.parse(localStorage.getItem("amart_orders")||"[]");orders.unshift({id:"AM"+Date.now().toString().slice(-6),created:new Date().toISOString(),name:f.get("name"),phone:f.get("phone"),address:f.get("address"),notes:f.get("notes"),items,total,status:"New"});localStorage.setItem("amart_orders",JSON.stringify(orders));cart=[];persistCart();closeCheckout();e.target.reset();showToast("Order placed! Cash on Delivery.");});
function renderOwner(){let products=getProducts(),orders=JSON.parse(localStorage.getItem("amart_orders")||"[]");let today=new Date().toDateString();let tod=orders.filter(o=>new Date(o.created).toDateString()===today);document.getElementById("newOrders").textContent=orders.filter(o=>o.status==="New").length;document.getElementById("todayOrders").textContent=tod.length;document.getElementById("todaySales").textContent=money(tod.reduce((s,o)=>s+o.total,0));document.getElementById("productTotal").textContent=products.length;document.getElementById("orders").innerHTML=orders.length?orders.map(o=>`<div class="order"><div class="order-top"><div><b>#${o.id}</b><div class="muted">${new Date(o.created).toLocaleString("en-IN")} • ${o.name}</div></div><span class="status">${o.status}</span></div><div class="order-items">${o.items.map(i=>`${i.name} × ${i.qty} — ${money(i.price*i.qty)}`).join("<br>")}<br><b>Total: ${money(o.total)}</b><br>📞 ${o.phone}<br>📍 ${o.address}${o.notes?`<br>📝 ${o.notes}`:""}</div><div class="order-actions"><button onclick="updateOrder('${o.id}','Preparing')">Accept / Preparing</button><button onclick="updateOrder('${o.id}','Out for Delivery')">Out for delivery</button><button onclick="updateOrder('${o.id}','Delivered')">Delivered</button></div></div>`).join(""):`<p class="muted">No orders yet. New customer orders will appear here.</p>`;document.getElementById("productTable").innerHTML=products.map(p=>`<div class="product-line"><b>${p.icon||"🛒"} ${p.name}</b><span>${p.unit}</span><input type="number" value="${p.price}" onchange="changePrice(${p.id},this.value)"><button class="small-btn" onclick="removeProduct(${p.id})">Remove</button></div>`).join("")}
function updateOrder(id,status){let o=JSON.parse(localStorage.getItem("amart_orders")||"[]");let x=o.find(a=>a.id===id);if(x)x.status=status;localStorage.setItem("amart_orders",JSON.stringify(o));renderOwner()}
function clearDemoOrders(){if(confirm("Clear all orders?")){localStorage.removeItem("amart_orders");renderOwner()}}
function changePrice(id,v){let p=getProducts();let x=p.find(a=>a.id===id);if(x){x.price=Number(v);saveProducts(p);renderOwner()}}
function removeProduct(id){if(confirm("Remove this product?")){saveProducts(getProducts().filter(p=>p.id!==id));renderOwner()}}
function addProduct(){let name=prompt("Product name:");if(!name)return;let price=Number(prompt("Price in ₹:","50")||0);let unit=prompt("Unit (e.g. 1 kg):","1 pack")||"1 pack";let cat=prompt("Category:","Other")||"Other";let p=getProducts();p.push({id:Date.now(),name,price,unit,cat,icon:"🛒"});saveProducts(p);renderOwner()}
function saveSettings(){localStorage.setItem("amart_settings",JSON.stringify({name:document.getElementById("storeName").value,location:document.getElementById("storeLocation").value,phone:document.getElementById("storePhone").value}));alert("Settings saved on this device.")}
if(document.getElementById("categories")){categories();renderProducts();renderCart()}
