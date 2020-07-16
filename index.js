require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose');
const multer = require('multer')
// const readXlsxFile = require('read-excel-file/node')
const XLSX = require('xlsx');



const Order = require('./model/Order.model')
const Unit = require('./model/Unit.model')



//
const app = express()
const port = process.env.PORT

//connect to DB
mongoose.connect(process.env.DB_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log("connected to atlas"));



//multer config
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const filesGetter = upload.fields([
	{ name : "root", maxCount : 1 },
	{ name : "unit", maxCount : 1 }
])

//set view engine
app.set('views', './views')
app.set('view engine', 'pug')

//set body parser
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

//set static file
app.use(express.static('public'))


app.get('/',  (req, res) => {
	
	const jobs = [
		Order.deleteMany({}).exec(), 
		Unit.find({}).exec()
	]

	Promise.all(jobs)
	.then(values => {
		let units = values[1]

		res.render("index", {
			units
		})
	})

})


app.post("/update", filesGetter, (req, res) => {

	//get unit excel file
	let unitPriceBuffer = req.files['unit'][0].buffer
	let unitFile = XLSX.read(unitPriceBuffer,  {type : "buffer", cellDates : true})
	let sheetsUnit = unitFile.SheetNames


	if(sheetsUnit.length > 0){

		//unit sheet
		let unitSheet = unitFile.Sheets["UNIT PRICE"]
		let unitData = XLSX.utils.sheet_to_json(unitSheet)

		let units = unitData.map(row => {

			// console.log(row);
			let unit = new Unit({
				fabricCode : row["fabric_code"],
				color : row["color"],
				price : row["price"]
			})

			return unit.save()

		})
		Promise.all(units)
		.then(values => {
			console.log("updated")
			res.redirect("/")
		})
	} else {
		res.sendStatus(500)
	}

})


app.post('/', filesGetter, (req, res) => {
	// console.log(req.files['root'][0]);
	// console.log(req.files['root'][0]);

	//get root excel file
	let rootBuffer = req.files['root'][0].buffer
	let rootFile = XLSX.read(rootBuffer,  {type : "buffer", cellDates : true})
	let sheetsRoot = rootFile.SheetNames

	

	if(sheetsRoot.length > 0){

		//order sheet
		let detailSheet = rootFile.Sheets["Detail"]
		let detailData = XLSX.utils.sheet_to_json(detailSheet)
		

		// save orders to DB
		let pattern = /white|heather/i


		let orders = detailData.map(row => {

			return (async row => {
							
				let color = pattern.exec(row['Color des'])
				color = color ? color[0].toUpperCase() : "SOLID"
				
				let fabricCode = row["ITEM"].split(".")[0]

				let unit = await Unit.findOne({ fabricCode, color }).exec()

				let order = {
					weekIssued : parseInt(row['week of PO issued']),
					item : row['ITEM'],
					quantity : parseInt(row['QUANTITY']),
					color,
					price : unit != null ? unit.price : 'not in unit' ,
					total : unit != null ?  parseInt(row['QUANTITY'])*unit.price : "unkown"
				}
				// console.log(order)
				return order

			})(row)
			
		})

		Promise.all(orders)
		.then(values => {

			//create a sheet
			let wb = XLSX.utils.book_new()
			let ws = XLSX.utils.json_to_sheet(values)
			XLSX.utils.book_append_sheet(wb, ws, "Bill")
			
			XLSX.write(wb, {
				type : "array"
			})
			// console.log(ws);
			//
			let fileName = 'thong_ke.xlsx';
		    res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
		    res.set("Content-Disposition", "attachment; filename=" + fileName);
		   
		    res.send(wb)		    

		})


		
		// res.redirect("/")
	
	} else {
		res.sendStatus(500)
	}





	// res.redirect("/")
})

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))