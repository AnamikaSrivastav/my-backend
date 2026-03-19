

const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
	host: 'localhost',
	user:'root',
	password:'annu',
	database:'flutter_api'
});

db.connect(err => {
	if(err){
		console.error('MySQL connection error:', err);
		return;
	}
	console.log('MySQL Connected');
});
app.get('/products',(req,res)=>{
	db.query('SELECT * FROM products', (err, result)=> {
		if(err){
			return res.status(500).json(err);
		}
		res.json(result);
	});
});

app.post('/orders',(req,res)=>{
	const {address,items,payment_method} = req.body;

	items.forEach(item =>{

		const sql =`
			INSERT INTO orders ( product_name, price, qty, address,status, payment_method,payment_status)
			VALUES ( ?, ?, ? ,?, ?,?,?)
		`;

		db.query(sql,[
			item.name,
			item.price,
			item.qty,
			address,
			"Pending",
			payment_method,
			payment_status
		]);
	});
	res.json({
		message:"Order saved successfully"
	});
});
app.get('/orders',(req,res)=> {
	const sql = "SELECT * FROM orders ORDER BY id DESC";

	db.query(sql,(err,result)=>{
		if (err) {
			return res.status(500).json(err);
		}
		res.json(result);
	});
});  

app.delete('/orders/:id',(req,res)=>{
	const orderId = req.params.id;

	const sql = "DELETE FROM orders WHERE id=?";

	db.query(sql,[orderId],(err,result)=>{
		if(err){
			return res.status(500).json(err);
		}

		res.json({
			message:"Order cancelled successfully"
		});
	});
});


app.post("/profile", (req,res)=>{
	const {name,email,phone,address}= req.body;

	const sql = "INSERT INTO users (name,email,phone,address) VALUES (?,?,?,?)";

	db.query(sql,[name,email,phone,address],(err,result)=>{
		if(err) throw err;
		res.json({message:"Profile saved"});
	});
});

app.get("/profile",(req,res)=>{
	db.query("SELECT * FROM users",(err,result)=>{
		if(err) throw err;
		res.json(result);
	});
});

// WISHLIST ////

app.post("/add_wishlist",(req,res)=>{
	const {product_id,name,price,image} = req.body;

	const sql="INSERT INTO wishlist(product_id,name,price,image) VALUES(?,?,?,?)";


	db.query(sql,[product_id,name,price,image],(err,result)=>{
		if (err) return res.send(err);

		res.send("wishlist added");
	});
});

app.get("/wishlist",(req,res)=>{
	db.query("SELECT * FROM wishlist",(err,result)=>{
		if (err) return res.send(err);

		res.json(result);
	});
});


app.delete("/remove_wishlist/:id",(req,res)=>{
	const id = req.params.id;

	db.query("DELETE FROM wishlist WHERE product_id=?",[id],
		(err,result)=>{
			if (err) return res.send(err);

			res.send("Deleted");
		});
});

app.post("/signup", async  (req,res)=>{
	const {username,email,password} = req.body;
try{

	const hashedPassword = await bcrypt.hash(password,10);

	const sql = "INSERT INTO login (username,email,password) VALUES (?,?,?)";

	db.query(sql, [username,email, hashedPassword], (err, result)=>{
		if (err) return res.json(err);

		res.json({message:"Signup Success"});
	});

} catch(error){
	res.json({message:"Error hashing password"});
}
	
	});

app.post("/login", (req, res)=>{
	const {email,password} = req.body;

	const sql = "SELECT * FROM login WHERE email = ? OR username=? "

	db.query(sql,[email,email], async (err,result)=>{
		if (err) {
			return res.json({message:"Database Error"});
		}

		if (result.length === 0) {
			return res.json({message:"User Not Found"});
		}

		const user = result[0];

		const match = await bcrypt.compare(password,user.password);

		if (match) {
			res.json({
				message:"Login Success",
				username:user.username,
				email:user.email
			});
		} else{
			res.json({message:"Wrong Password"});
		}
	});

});

// =========================== ADMIN LOGIN ==============================

app.post('/admin/login',(req,res)=>{
	const{email,password} = req.body;

	if(email === "admin@gmail.com" && password === "1234"){
		return res.json({
			success: true,
			role: "admin"
		});
	} else {
		return res.status(401).json({
			success: false,
			message:"Invalid Admin Login"
		});
	}
});
  
  ///================= UPADTE ORDER STATUS ===================//
app.put('/orders/:id/status', (req, res)=>{

	const { status } = req.body;

	console.log("STATUS:", status);

	db.query(
		"UPDATE orders SET status=? WHERE id=?",
		[status, req.params.id],
		(err)=>{
			if(err) return res.json(err);
			res.json({message:"Updated"});
		}
		);
	//const orderId = req.params.id;


	//const sql = "UPDATE orders SET status=? WHERE id=?";

	//db.query(sql, [status,orderId], (err,result)=>{
	//	if (err) {
			//return res.status(500).json(err);
	//	}

		//res.json({
		//	message: "Order status updated"
		});
	


//=========== DELETE PRODUCT =============//

app.delete('/products/:id', (req, res)=>{
	const productId = req.params.id;

	db.query("DELETE FROM products WHERE id=?", [productId], (err, result)=>{
       
       if (err) {
       	return res.status(500).json(err);

       }
       res.json({
       	message:"Product delete"
       });

	});
});


//================== UPDATE PRODUCT ====================//

app.put('/products/:id', (req, res)=>{
	const { name, price ,image , description } = req.body;

	const id = req.params.id;

	const sql = "UPDATE products SET name=?, price=?, image=?, description=? WHERE id=? ";

	db.query(sql , [name, price, image, description,id], (err, result)=>{

		if (err) {
			return res.status(500).json(err);
		}

		res.json({
			message: "Product updated"
		});

	});
});

app.post('/products', (req, res)=>{
	const {name , price,image,description}=req.body;

	const sql = "INSERT INTO products (name,price,image,description) VALUES(?,?,?,?)";

	db.query(sql,[name,price,image,description],(err,result)=>{
		if (err) return res.status(500).json(err);

		res.json({message:"Product added successfully"});
	});
});


app.listen(3000, '0.0.0.0',()=> {
	console.log('Server running on port 3000');
});



















