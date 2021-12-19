const inputElement = document.getElementById("input");

const preview = document.getElementById("preview");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext('2d');
var worker = new Tesseract.createWorker({
    logger: progressUpdate,
  });
const language = 'eng';

function handleFiles(e) {
    //const fileList = this.files; /* now you can work with the file list */
    //var file = e.dataTransfer.files[0];
    var file = this.files[0];
    if (!file.type.startsWith('image/')){ return }

    var img = new Image();
    img.onload = function(e) {
        console.log("loaded image");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
    
        (async () => {
            await worker.load();
            await worker.loadLanguage(language);
            await worker.initialize(language);
            const { data } = await worker.recognize(file);
            //await worker.terminate();
            result(data);
        })();
    };

    const reader = new FileReader();
    reader.onload = (function(aImg) { 
            return function(e) {
                console.log("loaded file");
                aImg.src = e.target.result;
            }
            }) (img);
    reader.readAsDataURL(file);
}

function progressUpdate(packet){
	var log = document.getElementById('log');

	if(log.firstChild && log.firstChild.status === packet.status){
		if('progress' in packet){
			var progress = log.firstChild.querySelector('progress')
			progress.value = packet.progress
		}
	}else{
		var line = document.createElement('div');
		line.status = packet.status;
		var status = document.createElement('div')
		status.className = 'status'
		status.appendChild(document.createTextNode(packet.status))
		line.appendChild(status)

		if('progress' in packet){
			var progress = document.createElement('progress')
			progress.value = packet.progress
			progress.max = 1
			line.appendChild(progress)
		}

		if(packet.status == 'done'){
			var pre = document.createElement('pre')
			pre.appendChild(document.createTextNode(packet.data.text))
			line.innerHTML = ''
			line.appendChild(pre)
		}

		log.insertBefore(line, log.firstChild)
	}
}

inputElement.addEventListener("change", handleFiles, false);


function result(res){
	// octx.clearRect(0, 0, output.width, output.height)
	// octx.textAlign = 'left'

	console.log('result was:', res)

	progressUpdate({ status: 'done', data: res })

    res.lines.forEach(function(line) {
        var b = line.bbox;
        ctx.strokeWidth = 2
        ctx.strokeStyle = 'red'
        ctx.strokeRect(b.x0, b.y0, b.x1-b.x0, b.y1-b.y0);
        ctx.beginPath()
    });

    /*
	res.words.forEach(function(w){
		var b = w.bbox;

		ctx.strokeWidth = 2

		ctx.strokeStyle = 'red'
		ctx.strokeRect(b.x0, b.y0, b.x1-b.x0, b.y1-b.y0)
		ctx.beginPath()
		ctx.moveTo(w.baseline.x0, w.baseline.y0)
		ctx.lineTo(w.baseline.x1, w.baseline.y1)
		ctx.strokeStyle = 'green'
		ctx.stroke()

        // octx.font = '20px Times';
        // octx.font = 20 * (b.x1 - b.x0) / octx.measureText(w.text).width + "px Times";
        // octx.fillText(w.text, b.x0, w.baseline.y0);
	})
    */
}