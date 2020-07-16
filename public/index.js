let files = document.getElementById("files")
let fileInp = document.getElementById("root")
let sendBtn = document.getElementById("send-file")


sendBtn.addEventListener("click", () => {
	let file = fileInp.files[0]
	let formData = new FormData()
	formData.append("root", file);
	console.log(formData);
	axios.post("/", formData, {
	    headers: {
	      'Content-Type': 'multipart/form-data'
	    }
	})
	.then(res => {
		console.log(res.data);
		XLSX.writeFile(res.data, "thong_ke.xlsx");
	})

})