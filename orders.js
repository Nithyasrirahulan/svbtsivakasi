const { Resend } = require("resend");
const products = require("../frontend/data/products.json");

const resend = new Resend(process.env.RESEND_API_KEY);
const ORDER_EMAIL = process.env.ORDER_EMAIL || "svbtsivakasi@gmail.com";

function cors(res){
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function orderId(){
  const d=new Date();
  const stamp=d.toISOString().slice(0,10).replace(/-/g,"");
  const rand=Math.random().toString(36).slice(2,6).toUpperCase();
  return `SBT-${stamp}-${rand}`;
}
function validEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);}
function validMobile(v){return /^[0-9 +()\-]{10,15}$/.test(v);}

module.exports = async (req,res)=>{
  cors(res);
  if(req.method==="OPTIONS") return res.status(204).end();
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
  try{
    const body=req.body||{};
    const c=body.customer||{};
    if(!c.name||!c.mobile||!c.email||!c.state||!c.address) return res.status(400).json({error:"All customer fields are required."});
    if(!validEmail(c.email)) return res.status(400).json({error:"Invalid email address."});
    if(!validMobile(c.mobile)) return res.status(400).json({error:"Invalid mobile number."});
    if(!Array.isArray(body.items)||!body.items.length) return res.status(400).json({error:"Cart is empty."});

    const lines=[];
    let total=0;
    for(const item of body.items){
      const p=products.find(x=>x.id===item.productId);
      const qty=Number(item.quantity);
      if(!p) return res.status(400).json({error:`Invalid product: ${item.productId}`});
      if(!Number.isInteger(qty)||qty<1||qty>999) return res.status(400).json({error:`Invalid quantity for ${p.name}`});
      const amount=p.offerPrice*qty;
      total+=amount;
      lines.push({...p,qty,amount});
    }

    const id=orderId();
    const rows=lines.map(p=>`<tr><td>${esc(p.code)}</td><td>${esc(p.name)}</td><td>${esc(p.brand)}</td><td>${esc(p.pack)}</td><td>₹${p.offerPrice.toLocaleString("en-IN")}</td><td>${p.qty}</td><td>₹${p.amount.toLocaleString("en-IN")}</td></tr>`).join("");
    const html=`<div style="font-family:Arial,sans-serif;color:#23140f">
      <h2>New Order - Srivari Balaji Traders</h2>
      <p><b>Order ID:</b> ${esc(id)}</p>
      <h3>Customer</h3>
      <p><b>Name:</b> ${esc(c.name)}<br><b>Mobile:</b> ${esc(c.mobile)}<br><b>Email:</b> ${esc(c.email)}<br><b>State:</b> ${esc(c.state)}<br><b>Address:</b> ${esc(c.address)}</p>
      <h3>Items</h3><table border="1" cellpadding="7" cellspacing="0" style="border-collapse:collapse"><thead><tr><th>Code</th><th>Product</th><th>Brand</th><th>Pack</th><th>Offer Price</th><th>Qty</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table>
      <h2>Total: ₹${total.toLocaleString("en-IN")}</h2>
      <p>Generated from the Srivari Balaji Traders website.</p>
    </div>`;

    const result=await resend.emails.send({
      from: process.env.FROM_EMAIL || "Srivari Balaji Traders <onboarding@resend.dev>",
      to:[ORDER_EMAIL],
      reply_to:c.email,
      subject:`New Order ${id} - Srivari Balaji Traders`,
      html
    });
    if(result.error) return res.status(502).json({error:"Email could not be sent. Please try again."});
    return res.status(200).json({ok:true,orderId:id,total});
  }catch(err){
    console.error(err);
    return res.status(500).json({error:"Server error while placing order."});
  }
};
