const fs = require('fs');
const path = require('path');

const { v4: uuidv4 } = require('uuid');
uuidv4();

const productsFilePath = path.join(__dirname, '../data/productsDataBase.json');

const getJson = () => {
	const productsFilePath = path.join(__dirname, '../data/productsDataBase.json');
	const products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));
	return products;
}


const toThousand = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const controller = {
	// Root - Show all products
	index: (req, res) => {
		const product = getJson();
		res.render("products",{product})
		console.log(product)
	},

	// Detail - Detail from one product
	detail: (req, res) => {
		const {id} = req.params;
		const products = getJson();
		const product = products.find(product => product.id == id)
		res.render("detail",{title: product.name, product, toThousand})
	},

	// Create - Form to create
	create: (req, res) => {
		res.render("product-create-form");
	},
	
	// Create -  Method to store
	store: (req, res) => {
		console.log("req:", req)
		const files = req.files;
		const images = [];
		files.forEach(element => {
			images.push(element.filename);
		});
		const id = uuidv4();
		const {name, price, discount, category, description} = req.body;
		const products = getJson();
		const product = {
			id,
			name: name.trim(),
			price:+price,
			discount,
			category,
			description: description.trim(),
			images: files ? images : ["default.jpg"],
		}
		products.push(product)
		const json = JSON.stringify(products);
		fs.writeFileSync(productsFilePath, json, "utf-8");
		res.redirect(`/products/detail/${id}`);
	},

	// Update - Form to edit
	edit: (req, res) => {
		const {id} = req.params;
		const products = getJson();
		const product = products.find(product => product.id == id);
		res.render("product-edit-form",{title: 'Editando: ',product,toThousand});
	},
	// Update - Method to update
	update: (req, res) => {
		const {id} = req.params;
		const {name, price, discount, category, description, image} = req.body;
		const products = getJson();
		const nuevoArray = products.map(product => {
			if (product.id == id){
				return{
					id,
					name: name.trim(),
					price,
					discount,
					category,
					description: description.trim(),
					image: image ? image : product.image,
				}
			}
			return product;
		})
		const json = JSON.stringify(nuevoArray);
		fs.writeFileSync(productsFilePath, json, "utf-8");
		res.redirect(`/products/detail/${id}`)
	},

	// Delete - Delete one product from DB
	destroy : (req, res) => {
		const {id} = req.params;
		const productos = getJson();
		const product = productos.find(product => product.id == id);
		const listaNueva = productos.filter(elemento => elemento.id != id);
		const json = JSON.stringify(listaNueva);
		
		// product.image.forEach(image =>{
		// fs.unlink(`./public/images/products/${product.image}`)
		// })

		fs.unlink(`./public/images/products/${product.image}`,(err)=>{
		if(err) throw err;

		});

		fs.writeFileSync(productsFilePath, json, "utf-8");
		res.redirect("/products")
	}
};

module.exports = controller;