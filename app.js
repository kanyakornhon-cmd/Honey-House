// ใส่ URL ของ Google Apps Script Web App หลังจาก Deploy แล้ว
const SHEETS_API_URL = "";
const products = [
 {sku:"HNY001",name:"น้ำผึ้งดอกไม้ป่า 500 กรัม",price:250,image:"public/images/honey-001.jpg"},
 {sku:"HNY002",name:"น้ำผึ้งดอกลำไย 500 กรัม",price:290,image:"public/images/honey-002.jpeg"}
];
let cart = {};
const $ = id => document.getElementById(id);
function renderProducts(){ $("product-grid").innerHTML=products.map(p=>`<article class="product"><img src="${p.image}" alt="${p.name}" onerror="this.style.opacity=.25"><div class="sku">${p.sku}</div><h3>${p.name}</h3><div class="price">฿${p.price.toLocaleString("th-TH")}</div><button class="primary" onclick="addToCart('${p.sku}')">เพิ่มลงตะกร้า</button></article>`).join(""); }
function addToCart(sku){cart[sku]=(cart[sku]||0)+1;renderCart();}
function changeQty(sku,n){cart[sku]=(cart[sku]||0)+n;if(cart[sku]<=0)delete cart[sku];renderCart();}
function renderCart(){const rows=products.filter(p=>cart[p.sku]).map(p=>`<div class="cart-row"><div><b>${p.name}</b><div>฿${p.price} × ${cart[p.sku]}</div></div><div class="qty"><button onclick="changeQty('${p.sku}',-1)">−</button> ${cart[p.sku]} <button onclick="changeQty('${p.sku}',1)">+</button></div></div>`).join("");$("cart-items").innerHTML=rows||"ยังไม่มีสินค้าในตะกร้า";const count=Object.values(cart).reduce((a,b)=>a+b,0);$("cart-count").textContent=count;$("cart-total").textContent="฿"+total().toLocaleString("th-TH");}
function total(){return products.reduce((s,p)=>s+p.price*(cart[p.sku]||0),0)}
$("cart-open").onclick=()=>$("cart-panel").classList.remove("hidden");$("cart-close").onclick=()=>$("cart-panel").classList.add("hidden");$("checkout-close").onclick=()=>$("checkout-panel").classList.add("hidden");
$("checkout-open").onclick=()=>{if(!Object.keys(cart).length){alert("กรุณาเลือกสินค้าก่อน");return}$("cart-panel").classList.add("hidden");$("checkout-panel").classList.remove("hidden");};
$("checkout-form").onsubmit=async e=>{e.preventDefault();const msg=$("checkout-message");if(!Object.keys(cart).length){msg.textContent="กรุณาเลือกสินค้า";return;}const fd=new FormData(e.target);const order={action:"createOrder",customerName:fd.get("customerName"),phone:fd.get("phone"),address:fd.get("address"),province:fd.get("province"),postcode:fd.get("postcode"),note:fd.get("note"),items:products.filter(p=>cart[p.sku]).map(p=>({sku:p.sku,name:p.name,price:p.price,quantity:cart[p.sku]})),total:total(),createdAt:new Date().toISOString()};if(!SHEETS_API_URL){msg.textContent="เว็บไซต์พร้อมทดลองแล้ว แต่ยังไม่ได้เชื่อม Google Sheets กรุณาตั้งค่า SHEETS_API_URL ก่อนรับออเดอร์จริง";msg.classList.add("error");return;}try{const r=await fetch(SHEETS_API_URL,{method:"POST",body:JSON.stringify(order)});const result=await r.json();if(!result.success)throw new Error(result.message||"บันทึกไม่สำเร็จ");msg.textContent="รับคำสั่งซื้อแล้ว เลขที่ "+result.orderId;cart={};renderCart();e.target.reset();}catch(err){msg.textContent="ส่งคำสั่งซื้อไม่สำเร็จ: "+err.message;msg.classList.add("error");}};
renderProducts();renderCart();