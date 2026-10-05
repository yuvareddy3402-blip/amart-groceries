const express=require("express"), path=require("path"), Database=require("better-sqlite3");
const app=express(), db=new Database(process.env.DB_FILE||"amart.db");
app.use(express.json()); app.use(express.static(path.join(__dirname,"public")));
db.exec(`CREATE TABLE IF NOT EXISTS products(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,unit TEXT,price REAL NOT NULL,category TEXT,icon TEXT,active INTEGER DEFAULT 1);
CREATE TABLE IF NOT EXISTS orders(id INTEGER PRIMARY KEY AUTOINCREMENT,customer_name TEXT NOT NULL,phone TEXT NOT NULL,address TEXT NOT NULL,notes TEXT,total REAL NOT NULL,status TEXT DEFAULT 'New',created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS order_items(id INTEGER PRIMARY KEY AUTOINCREMENT,order_id INTEGER,product_id INTEGER,name TEXT,qty INTEGER,price REAL);`);
const count=db.prepare("SELECT COUNT(*) c FROM products").get().c;
if(!count){const ins=db.prepare("INSERT INTO products(name,unit,price,category,icon) VALUES(?,?,?,?,?)");[
["Aashirvaad Atta","5 kg",285,"Staples","🌾"],["India Gate Rice","5 kg",390,"Staples","🍚"],["Toor Dal","1 kg",165,"Staples","🫘"],["Sunflower Oil","1 L",145,"Oils","🫗"],["Amul Milk","1 L",68,"Dairy","🥛"],["Amul Curd","500 g",40,"Dairy","🥣"],["Parle-G Biscuits","800 g",80,"Snacks","🍪"],["Tata Salt","1 kg",30,"Staples","🧂"],["Lux Soap","100 g",38,"Personal Care","🧼"],["Surf Excel","1 kg",145,"Household","🧺"],["Tea Powder","250 g",115,"Beverages","☕"],["Coca-Cola","750 ml",45,"Beverages","🥤"]].forEach(x=>ins.run(...x));}

app.get("/api/products",(req,res)=>res.json(db.prepare("SELECT id,name,unit,price,category,icon FROM products WHERE active=1 ORDER BY category,name").all()));
app.post("/api/orders",(req,res)=>{
 try{
  const {name,phone,address,notes,items}=req.body;
  if(!name||!phone||!address||!Array.isArray(items)||!items.length) return res.status(400).json({error:"Missing order details"});
  const ids=items.map(x=>Number(x.id)); const products=db.prepare(`SELECT * FROM products WHERE active=1 AND id IN (${ids.map(()=>"?").join(",")})`).all(...ids);
  const map=new Map(products.map(p=>[p.id,p])); let total=0, clean=[];
  for(const x of items){const p=map.get(Number(x.id)), q=Math.max(1,Math.min(99,Number(x.qty)||1)); if(!p) return res.status(400).json({error:"Product unavailable"}); total+=p.price*q; clean.push({p,q});}
  const now=new Date().toISOString();
  const tx=db.transaction(()=>{const o=db.prepare("INSERT INTO orders(customer_name,phone,address,notes,total,status,created_at) VALUES(?,?,?,?,?,?,?)").run(name,phone,address,notes||"",total,"New",now);const ins=db.prepare("INSERT INTO order_items(order_id,product_id,name,qty,price) VALUES(?,?,?,?,?)");clean.forEach(x=>ins.run(o.lastInsertRowid,x.p.id,x.p.name,x.q,x.p.price));return o.lastInsertRowid;});
  res.json({orderId:tx(),total});
 }catch(e){res.status(500).json({error:"Could not place order"})}
});
app.get("/api/orders",(req,res)=>{const orders=db.prepare("SELECT * FROM orders ORDER BY id DESC").all();const ins=db.prepare("SELECT name,qty,price FROM order_items WHERE order_id=?");res.json(orders.map(o=>({...o,items:ins.all(o.id)})))});
app.patch("/api/orders/:id",(req,res)=>{const allowed=["New","Preparing","Out for Delivery","Delivered","Cancelled"];if(!allowed.includes(req.body.status))return res.status(400).json({error:"Invalid status"});db.prepare("UPDATE orders SET status=? WHERE id=?").run(req.body.status,req.params.id);res.json({ok:true})});
app.patch("/api/products/:id",(req,res)=>{const {price,active,name,unit,category}=req.body;db.prepare("UPDATE products SET price=COALESCE(?,price),active=COALESCE(?,active),name=COALESCE(?,name),unit=COALESCE(?,unit),category=COALESCE(?,category) WHERE id=?").run(price,active,name,unit,category,req.params.id);res.json({ok:true})});
app.post("/api/products",(req,res)=>{const {name,unit,price,category,icon="🛒"}=req.body;if(!name||!price)return res.status(400).json({error:"Name and price required"});const r=db.prepare("INSERT INTO products(name,unit,price,category,icon) VALUES(?,?,?,?,?)").run(name,unit||"1 pack",price,category||"Other",icon);res.json({id:r.lastInsertRowid})});
app.get(/.*/,(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
app.listen(process.env.PORT||3000,()=>console.log("Amart running"));
