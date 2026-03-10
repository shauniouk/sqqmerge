
var oddeven = "even"
var questionPackType = "sqq";

function loadXML() {
	var input = document.getElementById('xmlFileInput');
	var file = input.files[0];

	input.value = null;

	if (file) {
		var reader = new FileReader();

		reader.onload = function (e) {
			var xmlString = e.target.result;
			
			//remove all tabs, line breaks and carriage returns.
			xmlString = xmlString.replace(/[\t\n\r]/gm,'');

			//replace and ' & ' with ' and '
			xmlString = xmlString.replace(' & ', ' and ')
			xmlString = xmlString.replace('&', ' and ')
			
			var parser = new DOMParser();
			var xmlDoc = parser.parseFromString(xmlString, 'text/xml');

			loadPackFromSSQXML(xmlDoc, file.name);
			
			
		};

		reader.readAsText(file);
	} else {
		alert('Please select an XML file.');
	}
}

function fetchPackXML(filePath, packName) {
	
	var x = new XMLHttpRequest();
	x.open("GET", filePath + packName, true);
	x.setRequestHeader('Content-Type', 'text/xml');
	x.setRequestHeader('Cache-Control', 'no-cache, no-store, max-age=0');
	x.setRequestHeader('Pragma', 'no-cache');


	x.onreadystatechange = function () {
	  if (x.readyState == 4 && x.status == 200)
	  {
		var doc = x.responseXML;
		
		var sqqXML = new XMLSerializer().serializeToString(doc);
		//remove all tabs, line breaks and carriage returns.
		sqqXML = sqqXML.replace(/[\t\n\r]/gm,'');
		
		var parser = new DOMParser();
		var xmlDoc = parser.parseFromString(sqqXML, 'text/xml');
		
		loadPackFromSSQXML(xmlDoc, packName);
		
	  }
	};
	x.send();
	
}

function loadPackFromSSQXML(xmlDoc, fileName) {
	
	var table = document.getElementById("sqqpacks");
			var questions = xmlDoc.getElementsByTagName("question");
			
			oddeven = (oddeven == "even") ? "odd" : "even";
			
			
			var tb = table.createTBody()
			var row = tb.insertRow();
			row.classList.add("packheader");
			var cell1 = row.insertCell(0);
			
			cell1.colSpan = 4;
			cell1.innerHTML = "<div style='float: left;'><img src='packfolder.gif' width='16' height='13' style='margin-right: 5px;' />"+truncate(fileName.replace(".sqq",""), 50)+"</div>" + "<div style='float:right;'><a href=# onclick='removePack(this);'>remove</a></div>";
			cell1.title = fileName;
			
			for(let i = 0;i < questions.length; i++)
				{
					var row = table.insertRow(-1);
					
					row.classList.add("pack");
					row.classList.add(oddeven);
					
					var cell2 = row.insertCell(0);
					var cell3 = row.insertCell(1);
					var cell4 = row.insertCell(2);
					var cell5 = row.insertCell(3);
					
					
					var t = questions[i].getElementsByTagName("user_view")
					var p = questions[i].getElementsByTagName("picture")
					var q = questions[i].getElementsByTagName("q")
					var la = questions[i].getElementsByTagName("long_answer")
					var sa = questions[i].getElementsByTagName("short_answer")
					var o = questions[i].getElementsByTagName("options")
					
					if (t.length == 0 ) {
						t = [{ textContent: "multitap" }];
					}

					var answer = sa[0].textContent;

					if (p.length > 0 && la[0].textContent.length > 0 && t[0].textContent != "multi" && t[0].textContent != "sequence") {
						answer = la[0].textContent;
					}

					if (t[0].textContent == "multi"){
						asciivalue = answer.charCodeAt(0) - 65;
						answer = o[0].getElementsByTagName("option")[asciivalue].textContent;
					}

					if (t[0].textContent == "letters" && la[0].textContent.length > 0) {
						answer = sa[0].textContent + ' - ' + la[0].textContent;
					}

					if (t[0].textContent == "pinpoint"){
						answer = "";
					}

					// cell1.innerHTML = truncate(file.name.replace(".sqq",""), 30);
					// cell1.title = file.name;
					
					//cell2.innerHTML = t[0].textContent + ((p.length == 0) ? "" : " + pic");
					cell2.innerHTML = "<img src='q" + t[0].textContent + ".png' width='16' height='16' />"  + ((p.length == 0) ? "" : "<img src='qpicture.png' width='16' height='16' style='margin-left: 2px;' />");
					
					cell3.innerHTML = "<div style='display: flex;'><div style='flex-grow: 1;'>" + q[0].textContent + "</div><div style='text-align:right; flex: 1; font-size: 0.6rem; color: #444444; padding-right: 5px;'>" + answer + "</div></div>";
					cell3.title = q[0].textContent;
					
					cell4.dataxml = new XMLSerializer().serializeToString(questions[i]);
					cell4.innerHTML = "<a href=# onclick='showQuestion(this);'>view</a>";
					
					cell5.dataxml = cell4.dataxml
					cell5.innerHTML = "<a href=# onclick='addQuestionToNewPack(this);'>add</a>";

				}
	
}
function truncate(str, maxlength) {
  return (str.length > maxlength) ?
    str.slice(0, maxlength - 1) + '…' : str;
}

function removePack(e) {
	
	var tb = e.closest('tbody');
	
	tb.remove();
	
}

function showQuestion(e) {
	
	var parser = new DOMParser();
	var xmlDoc = parser.parseFromString(e.parentElement.dataxml, 'text/xml');
	
	showQuestionDetails(xmlDoc);
	showPicture(xmlDoc);

}

function showQuestionDetails(xmlDoc) {
	
	qa = document.getElementById("qd-add");
	qa.dataxml = new XMLSerializer().serializeToString(xmlDoc);

	var questiontype = xmlDoc.getElementsByTagName("user_view")
	var tdQuestion = document.getElementById("qd-question");
	var tdShort = document.getElementById("qd-short");
	var tdLong = document.getElementById("qd-long");
	var tdOptions = document.getElementById("qd-options");
	
	if (questiontype.length == 0 ) {
		questiontype = [{ textContent: "multitap" }];
	}

	//clear the current values
	tdQuestion.innerHTML = '';
	tdShort.innerHTML = '';
	tdLong.innerHTML = '';
	tdOptions.innerHTML = '';
	
	var qt = document.getElementById('qtype');
	qt.innerHTML = questiontype[0].textContent.toUpperCase();

	switch (questiontype[0].textContent) {
		case "multi":
			qt.style.backgroundColor = "#77ed7c";
			break;
		case "letters":
			qt.style.backgroundColor = "#2daefb";
			break;
		case "sequence":
			qt.style.backgroundColor = "#ea6fe4";
			break;
		case "numbers":
			qt.style.backgroundColor = "#fefd55";
			break;
		case "pinpoint":
			qt.style.backgroundColor = "#f69898";
			break;
		case "multitap":	
			qt.style.backgroundColor = "#74faff";
			break;
	}

	var t = xmlDoc.getElementsByTagName("q") 
	if (t.length > 0) {
		if (t[0].childNodes.length > 0) {
			tdQuestion.innerHTML = t[0].childNodes[0].nodeValue;
		}
	}
	
	t = xmlDoc.getElementsByTagName("short_answer")
	if (t.length > 0) {
		if (t[0].childNodes.length > 0) {
			tdShort.innerHTML = t[0].childNodes[0].nodeValue;
		}
	}
	
	t = xmlDoc.getElementsByTagName("long_answer")
	if (t.length > 0) {
		if (t[0].childNodes.length > 0) {
			if (questiontype[0].textContent == "pinpoint") {
				const longAnswer = t[0].childNodes[0].nodeValue;
				tdLong.innerHTML = longAnswer.replace(/(.{8})/g, '$1, ');
		} else {
			tdLong.innerHTML = t[0].childNodes[0].nodeValue;
		}}

	}
	
	if (questiontype[0].textContent != "pinpoint") {
		t = xmlDoc.getElementsByTagName("options")
		optans =xmlDoc.getElementsByTagName("short_answer")
		var counter = 0;
		if (t.length > 0) {
			if (t[0].childNodes.length > 0) {
				for(let i = 0;i < t[0].childNodes.length; i++)
				{
					if(t[0].childNodes[i].nodeType !== Node.TEXT_NODE) {
						if(questiontype[0].textContent == "sequence") {
							counter++;
							tdOptions.innerHTML +=  counter.toString() + ') ' + t[0].childNodes[i].childNodes[0].nodeValue + '<br/>';
						} else {
							let charCode = String.fromCharCode(65 + counter);
							let charCount = 0;
							let optansValue = optans[0].textContent;
							let isBold = optansValue.includes(charCode) ? 'font-weight: bold; background-color: yellow;' : '';
							tdOptions.innerHTML += '<span style="' + isBold + '">' + charCode + ') ' + t[0].childNodes[i].childNodes[0].nodeValue + '</span><br/>';
							counter++;

						}
					}
				}
				
			}
		}
	}
	
}

function showPicture(xmlDoc){
	
	var p = xmlDoc.getElementsByTagName("picture"); 
	var picImg = document.getElementById("qpic");
	var qt = document.getElementById('qtype');

	if (p.length > 0) {
		var img64 = p[0].childNodes[0].nodeValue;
		//img64 = img64.replace(/(\r\n|\n|\r)/gm, "");
		picImg.style.backgroundImage = 'url(\'data:image/jpeg;base64,' + img64 + '\')';
		
	} else {
		picImg.style.backgroundImage = 'url(\'data:image/jpeg;base64,' + '' + '\')';
	}

	// Remove any existing toggle button
	const existingToggle = document.getElementById('svg-toggle-btn');
	if (existingToggle) {
		existingToggle.remove();
	}

	if (qt.textContent == "PINPOINT"){
		t = xmlDoc.getElementsByTagName("long_answer")
		const longAnswer = t[0].childNodes[0].nodeValue;

		// Parse points
		const points = [];
		for (let i = 0; i < longAnswer.length; i += 8) {
			const xPercent = parseInt(longAnswer.substr(i, 4)) / 10000;
			const yPercent = parseInt(longAnswer.substr(i + 4, 4)) / 10000;
			points.push({ x: xPercent * 480, y: yPercent * 690 });
		}

		// Remove any existing SVG before adding a new one
		const existingSvg = picImg.parentElement.querySelector('svg');
		if (existingSvg) {
			existingSvg.remove();
		}

		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('width', '480');
		svg.setAttribute('height', '690');
		svg.setAttribute('style', 'position: absolute; top: 0; left: 0; z-index: 10;');

		// If only two points, draw a rectangle (square) and make only top-left and bottom-right draggable
		if (points.length === 2) {
			const [tl, br] = points;
			// Rectangle corners
			const tr = { x: br.x, y: tl.y };
			const bl = { x: tl.x, y: br.y };
			const rectPoints = [tl, tr, br, bl];
			const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
			polygon.setAttribute('points', rectPoints.map(p => p.x + ',' + p.y).join(' '));
			polygon.setAttribute('fill', 'rgba(255, 0, 0, 0.2)');
			polygon.setAttribute('stroke', 'red');
			polygon.setAttribute('stroke-width', '2');
			svg.appendChild(polygon);

			// Drag entire rectangle
			let dragRect = false;
			let dragStart = { x: 0, y: 0 };
			let origTL = { x: tl.x, y: tl.y };
			let origBR = { x: br.x, y: br.y };

			polygon.addEventListener('mousedown', function(evt) {
				// Only start drag if not on a handle
				if (evt.target.nodeName === 'polygon') {
					dragRect = true;
					const rect = svg.getBoundingClientRect();
					dragStart.x = evt.clientX - rect.left;
					dragStart.y = evt.clientY - rect.top;
					origTL = { x: tl.x, y: tl.y };
					origBR = { x: br.x, y: br.y };
					evt.stopPropagation();
				}
			});

			svg.addEventListener('mousemove', function(evt) {
				if (!dragRect) return;
				const rect = svg.getBoundingClientRect();
				let x = evt.clientX - rect.left;
				let y = evt.clientY - rect.top;
				let dx = x - dragStart.x;
				let dy = y - dragStart.y;
				// Move both points
				tl.x = Math.max(0, Math.min(480, origTL.x + dx));
				tl.y = Math.max(0, Math.min(690, origTL.y + dy));
				br.x = Math.max(0, Math.min(480, origBR.x + dx));
				br.y = Math.max(0, Math.min(690, origBR.y + dy));
				// Update handles
				svg.querySelectorAll('circle').forEach((h, idx) => {
					h.setAttribute('cx', idx === 0 ? tl.x : br.x);
					h.setAttribute('cy', idx === 0 ? tl.y : br.y);
				});
				// Update rectangle corners
				const tr = { x: br.x, y: tl.y };
				const bl = { x: tl.x, y: br.y };
				const rectPoints = [tl, tr, br, bl];
				polygon.setAttribute('points', rectPoints.map(p => p.x + ',' + p.y).join(' '));
			});

			window.addEventListener('mouseup', function() {
				if (dragRect) {
					dragRect = false;
					// Save new coordinates to XML and update display
					let newLongAnswer = [tl, br].map(p => {
						let x = Math.round((p.x / 480) * 10000).toString().padStart(4, '0');
						let y = Math.round((p.y / 690) * 10000).toString().padStart(4, '0');
						return x + y;
					}).join('');
					let longAnswerElem = xmlDoc.getElementsByTagName('long_answer')[0];
					if (longAnswerElem.childNodes.length > 0) {
						longAnswerElem.childNodes[0].nodeValue = newLongAnswer;
					} else {
						longAnswerElem.appendChild(xmlDoc.createTextNode(newLongAnswer));
					}
					let tdLong = document.getElementById('qd-long');
					if (tdLong) {
						tdLong.innerHTML = newLongAnswer.replace(/(.{8})/g, '$1, ');
					}

					const questionDiv = document.getElementById('qd-add');
						if (questionDiv.dataxml) {
							const parser = new DOMParser();
							const xmlDoc = parser.parseFromString(questionDiv.dataxml, 'text/xml');
							const longAnswerElement = xmlDoc.querySelector('long_answer');
							if (longAnswerElement) {
								longAnswerElement.textContent = newLongAnswer;
								questionDiv.dataxml = new XMLSerializer().serializeToString(xmlDoc);
							}
						}
				}
			});

			// Add draggable handles for tl and br only
			[tl, br].forEach((pt, idx) => {
				const handle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
				handle.setAttribute('cx', pt.x);
				handle.setAttribute('cy', pt.y);
				handle.setAttribute('r', 6);
				handle.setAttribute('fill', idx === 0 ? '#0077ff' : '#ff7700');
				handle.setAttribute('stroke', '#fff');
				handle.setAttribute('stroke-width', '2');
				handle.style.cursor = 'pointer';
				handle.setAttribute('data-idx', idx);

				let dragging = false;

				handle.addEventListener('mousedown', function(evt) {
					dragging = true;
					evt.stopPropagation();
				});

				svg.addEventListener('mousemove', function(evt) {
					if (!dragging) return;
					const rect = svg.getBoundingClientRect();
					let x = evt.clientX - rect.left;
					let y = evt.clientY - rect.top;
					// Clamp to bounds
					x = Math.max(0, Math.min(480, x));
					y = Math.max(0, Math.min(690, y));
					pt.x = x;
					pt.y = y;
					handle.setAttribute('cx', x);
					handle.setAttribute('cy', y);
					// Update rectangle corners
					const tr = { x: br.x, y: tl.y };
					const bl = { x: tl.x, y: br.y };
					const rectPoints = [tl, tr, br, bl];
					polygon.setAttribute('points', rectPoints.map(p => p.x + ',' + p.y).join(' '));
				});

				window.addEventListener('mouseup', function() {
					if (dragging) {
						dragging = false;
						// Save new coordinates to XML and update display
						let newLongAnswer = [tl, br].map(p => {
							let x = Math.round((p.x / 480) * 10000).toString().padStart(4, '0');
							let y = Math.round((p.y / 690) * 10000).toString().padStart(4, '0');
							return x + y;
						}).join('');
						let longAnswerElem = xmlDoc.getElementsByTagName('long_answer')[0];
						if (longAnswerElem.childNodes.length > 0) {
							longAnswerElem.childNodes[0].nodeValue = newLongAnswer;
						} else {
							longAnswerElem.appendChild(xmlDoc.createTextNode(newLongAnswer));
						}
						let tdLong = document.getElementById('qd-long');
						if (tdLong) {
							tdLong.innerHTML = newLongAnswer.replace(/(.{8})/g, '$1, ');
						}

						const questionDiv = document.getElementById('qd-add');
							if (questionDiv.dataxml) {
								const parser = new DOMParser();
								const xmlDoc = parser.parseFromString(questionDiv.dataxml, 'text/xml');
								const longAnswerElement = xmlDoc.querySelector('long_answer');
								if (longAnswerElement) {
									longAnswerElement.textContent = newLongAnswer;
									questionDiv.dataxml = new XMLSerializer().serializeToString(xmlDoc);
								}
							}
					}
				});

				svg.appendChild(handle);
			});
		} else {
			// Usual polygon for >2 points
			const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
			polygon.setAttribute('points', points.map(p => p.x + ',' + p.y).join(' '));
			polygon.setAttribute('fill', 'rgba(255, 0, 0, 0.2)');
			polygon.setAttribute('stroke', 'red');
			polygon.setAttribute('stroke-width', '2');
			svg.appendChild(polygon);

			// Drag entire polygon
			let dragPoly = false;
			let dragStart = { x: 0, y: 0 };
			let origPoints = [];

			polygon.addEventListener('mousedown', function(evt) {
				if (evt.target.nodeName === 'polygon') {
					dragPoly = true;
					const rect = svg.getBoundingClientRect();
					dragStart.x = evt.clientX - rect.left;
					dragStart.y = evt.clientY - rect.top;
					origPoints = points.map(p => ({ x: p.x, y: p.y }));
					evt.stopPropagation();
				}
			});

			svg.addEventListener('mousemove', function(evt) {
				if (!dragPoly) return;
				const rect = svg.getBoundingClientRect();
				let x = evt.clientX - rect.left;
				let y = evt.clientY - rect.top;
				let dx = x - dragStart.x;
				let dy = y - dragStart.y;
				points.forEach((p, idx) => {
					p.x = Math.max(0, Math.min(480, origPoints[idx].x + dx));
					p.y = Math.max(0, Math.min(690, origPoints[idx].y + dy));
				});
				// Update handles
				svg.querySelectorAll('circle').forEach((h, idx) => {
					h.setAttribute('cx', points[idx].x);
					h.setAttribute('cy', points[idx].y);
				});
				polygon.setAttribute('points', points.map(p => p.x + ',' + p.y).join(' '));
			});

			window.addEventListener('mouseup', function() {
				if (dragPoly) {
					dragPoly = false;
					// Save new coordinates to XML and update display
					let newLongAnswer = points.map(p => {
						let x = Math.round((p.x / 480) * 10000).toString().padStart(4, '0');
						let y = Math.round((p.y / 690) * 10000).toString().padStart(4, '0');
						return x + y;
					}).join('');
					let longAnswerElem = xmlDoc.getElementsByTagName('long_answer')[0];
					if (longAnswerElem.childNodes.length > 0) {
						longAnswerElem.childNodes[0].nodeValue = newLongAnswer;
					} else {
						longAnswerElem.appendChild(xmlDoc.createTextNode(newLongAnswer));
					}
					let tdLong = document.getElementById('qd-long');
					if (tdLong) {
						tdLong.innerHTML = newLongAnswer.replace(/(.{8})/g, '$1, ');
					}

					const questionDiv = document.getElementById('qd-add');
						if (questionDiv.dataxml) {
							const parser = new DOMParser();
							const xmlDoc = parser.parseFromString(questionDiv.dataxml, 'text/xml');
							const longAnswerElement = xmlDoc.querySelector('long_answer');
							if (longAnswerElement) {
								longAnswerElement.textContent = newLongAnswer;
								questionDiv.dataxml = new XMLSerializer().serializeToString(xmlDoc);
							}
						}
				}
			});

			// Add draggable handles for all points
			points.forEach((pt, idx) => {
				const handle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
				handle.setAttribute('cx', pt.x);
				handle.setAttribute('cy', pt.y);
				handle.setAttribute('r', 4);
				handle.setAttribute('fill', 'rgba(255, 251, 0, 0.62)');
				handle.setAttribute('stroke', '#000000');
				handle.setAttribute('stroke-width', '1');
				handle.style.cursor = 'pointer';
				handle.setAttribute('data-idx', idx);

				let dragging = false;

				handle.addEventListener('mousedown', function(evt) {
					dragging = true;
					evt.stopPropagation();
				});

				svg.addEventListener('mousemove', function(evt) {
					if (!dragging) return;
					const rect = svg.getBoundingClientRect();
					let x = evt.clientX - rect.left;
					let y = evt.clientY - rect.top;
					// Clamp to bounds
					x = Math.max(0, Math.min(480, x));
					y = Math.max(0, Math.min(690, y));
					handle.setAttribute('cx', x);
					handle.setAttribute('cy', y);
					points[idx].x = x;
					points[idx].y = y;
					polygon.setAttribute('points', points.map(p => p.x + ',' + p.y).join(' '));
				});

				window.addEventListener('mouseup', function() {
					if (dragging) {
						dragging = false;
						// Save new coordinates to XML and update display
						let newLongAnswer = points.map(p => {
							let x = Math.round((p.x / 480) * 10000).toString().padStart(4, '0');
							let y = Math.round((p.y / 690) * 10000).toString().padStart(4, '0');
							return x + y;
						}).join('');

						let longAnswerElem = xmlDoc.getElementsByTagName('long_answer')[0];
						if (longAnswerElem.childNodes.length > 0) {
							longAnswerElem.childNodes[0].nodeValue = newLongAnswer;
						} else {
							longAnswerElem.appendChild(xmlDoc.createTextNode(newLongAnswer));
						}
						let tdLong = document.getElementById('qd-long');
						if (tdLong) {
							tdLong.innerHTML = newLongAnswer.replace(/(.{8})/g, '$1, ');
						}

						const questionDiv = document.getElementById('qd-add');
							if (questionDiv.dataxml) {
								const parser = new DOMParser();
								const xmlDoc = parser.parseFromString(questionDiv.dataxml, 'text/xml');
								const longAnswerElement = xmlDoc.querySelector('long_answer');
								if (longAnswerElement) {
									longAnswerElement.textContent = newLongAnswer;
									questionDiv.dataxml = new XMLSerializer().serializeToString(xmlDoc);
								}
							}
					}
				});

				svg.appendChild(handle);
			});
		}

		picImg.parentElement.style.position = 'relative';
		svg.style.position = 'absolute';
		picImg.parentElement.appendChild(svg);

		// Add toggle button above the image
		const toggleBtn = document.createElement('button');
		toggleBtn.id = 'svg-toggle-btn';
		toggleBtn.textContent = 'Hide Overlay';
		toggleBtn.style.marginLeft = '50px';
		document.getElementById('qpicheader').appendChild(toggleBtn);

		toggleBtn.addEventListener('click', function() {
			if (svg.style.display === 'none') {
				svg.style.display = '';
				toggleBtn.textContent = 'Hide Overlay';
			} else {
				svg.style.display = 'none';
				toggleBtn.textContent = 'Show Overlay';
			}
		});
	}
}

function displayQuestionDiv(questionType) {
	
	var ql = document.getElementById('qletter');
	var qn = document.getElementById('qnumber');
	var qm = document.getElementById('qmulti');
	var qs = document.getElementById('qsequence');
	
	ql.style.display = (questionType == 'letters') ? 'block' : 'none';
	qn.style.display = (questionType == 'numbers') ? 'block' : 'none';
	qm.style.display = (questionType == 'multi') ? 'block' : 'none';
	qs.style.display = (questionType == 'sequence') ? 'block' : 'none';


}

// Javascript for adding, moving and removing to new SQQ file
function addQuestionToNewPack(e) {
	
	var parser = new DOMParser();
	var xmlDoc = parser.parseFromString(e.parentElement.dataxml, 'text/xml');
	
	var tblBody = document.getElementById("sqqcreate");

	var tr = document.createElement("TR");
	tr.dataxml = xmlDoc;
	tr.classList.add("pack");
	tr.classList.add("odd");
	var td0 = document.createElement("TD");
	var td1 = document.createElement("TD");
	var td2 = document.createElement("TD");
	var td3 = document.createElement("TD");
	var td4 = document.createElement("TD");
	var td5 = document.createElement("TD");
	var td6 = document.createElement("TD");

	var t = xmlDoc.getElementsByTagName("user_view")

	if (t.length == 0 ) {
		t = [{ textContent: "multitap" }];
	}

	var p = xmlDoc.getElementsByTagName("picture")
	var q = xmlDoc.getElementsByTagName("q")

	var la = xmlDoc.getElementsByTagName("long_answer")
	var sa = xmlDoc.getElementsByTagName("short_answer")
	var o = xmlDoc.getElementsByTagName("options")

	var answer = sa[0].textContent;

	if (p.length > 0 && la[0].textContent.length > 0 && t[0].textContent != "multi" && t[0].textContent != "sequence") {
		answer = la[0].textContent;
	}

	if (t[0].textContent == "multi"){
		asciivalue = answer.charCodeAt(0) - 65;
		answer = o[0].getElementsByTagName("option")[asciivalue].textContent;
	}

	if (t[0].textContent == "letters" && la[0].textContent.length > 0) {
		answer = sa[0].textContent + ' - ' + la[0].textContent;
	}

	if (t[0].textContent == "pinpoint"){
		answer = "";
	}

	var input1 = document.createElement("INPUT");
	input1.type = "button";
	input1.value = "5";
	input1.classList.add("up");

	var input2 = document.createElement("INPUT");
	input2.type = "button";
	input2.value = "6";
	input2.classList.add("down");
	
	var input3 = document.createElement("INPUT");
	input3.type = "button";
	input3.value = "r";	
	input3.classList.add("delete");						

	if (document.addEventListener) {
		  input1.addEventListener("click", moveRow, false);
		  input2.addEventListener("click", moveRow, false);
		  input3.addEventListener("click", deleteRow, false);
	}
	else {
		  input1.onclick = moveRow;
		  input2.onclick = moveRow;
		  input3.onclick = deleteRow;
	}

	td0.id = "newpacknum";
	td0.innerHTML = document.getElementById("sqqcreate").rows.length;

	td3.dataxml = new XMLSerializer().serializeToString(xmlDoc);
	td3.innerHTML = "<a href=# onclick='showQuestion(this);'>view</a>&nbsp;&nbsp;";

	td1.innerHTML ="<img src='q" + t[0].textContent + ".png' width='16' height='16' />"  + ((p.length == 0) ? "" : "<img src='qpicture.png' width='16' height='16' style='margin-left: 2px;' />");

	var td2text = "<div style='display: flex;'><div style='flex-grow: 1;'>" + q[0].textContent + "</div><div style='text-align:right; flex: 1; font-size: 0.6rem; color: #444444; padding-right: 5px;'>" + answer + "</div></div>";

	td2.innerHTML = td2text;
	td4.appendChild(input1);
	td5.appendChild(input2);
	td6.appendChild(input3);

	tr.appendChild(td0);
	tr.appendChild(td1);
	tr.appendChild(td2);
	tr.appendChild(td3);
	tr.appendChild(td4);
	tr.appendChild(td5);
	tr.appendChild(td6);

	tblBody.appendChild(tr);
	
	showNewPackQuestionCount();
	saveNewPackToLocalStorage();
}

function deleteRow(e) {
	var tblBody = document.getElementById("sqqcreate");
	var button = (window.event) ? window.event.srcElement : e.target;
	var row = getParentRow(button);
	
	//tblBody.deleteRow(row);
	
	//var row = button.parentNode;
	row.parentNode.removeChild(row);
	
	showNewPackQuestionCount();

	renumberNewPackRows();
	saveNewPackToLocalStorage();
}

function moveRow(e) {
	var tblBody = document.getElementById("sqqcreate");
	var button = (window.event) ? window.event.srcElement : e.target;
	var row = getParentRow(button);

	switch (button.value.toUpperCase()) {
		  case "DOWN","6":
				if (row.nextSibling) {
					  var tmp1 = row;
					  var tmp2 = tblBody.removeChild(row.nextSibling);
					  tblBody.insertBefore(tmp2, tmp1);
				}
				break;
		  case "UP", "5":
				if (row.previousSibling && row.rowIndex > 1) {
					  var tmp1 = row.previousSibling;
					  var tmp2 = tblBody.removeChild(row);
					  tblBody.insertBefore(tmp2, tmp1);
				}
				break;
	}

	renumberNewPackRows();
	saveNewPackToLocalStorage();
}

function getParentRow(obj) {
	var tmp = obj;
	while (tmp = tmp.parentNode)
		  if (tmp.nodeName.toUpperCase() == "TR")
				return tmp;
}



function downloadSQQFile(filename, text) {
	
	var filename = document.getElementById("packname");
	text = getNewSQQXML();
	
	  var element = document.createElement('a');
	  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	  element.setAttribute('download', filename.value + '.' + questionPackType);

	  element.style.display = 'none';
	  //document.body.appendChild(element);

	  element.click();

	  //document.body.removeChild(element);
	}
	
const downloadToFile = (filename, contentType) => {
	
	content = getNewSQQXML();
	
  const a = document.createElement('a');
  const file = new Blob([content], { type: contentType });

  a.href = URL.createObjectURL(file);
  a.download = filename + '.sqq';
  a.click();

  URL.revokeObjectURL(a.href);
};


function getNewSQQXML() {
	
	var sqqXML = '<?xml version="1.0" encoding="utf-8"?><round><game>Keypad Quiz</game><title>SQQ Merge Packer</title><points_per_question>4</points_per_question><go_wide>false</go_wide><speed_bonus>true</speed_bonus><questions>';
	
	var table = document.getElementById("sqqcreate");
	for (var i = 1, row; row = table.rows[i]; i++) {
		sqqXML += new XMLSerializer().serializeToString(row.dataxml);
		}
	
	sqqXML += '</questions></round>';
	
	return sqqXML;
	
}

function showNewPackQuestionCount() {
	var table = document.getElementById("sqqcreate");
	var counter = document.getElementById("qcount");
	
	qcount.innerHTML = table.rows.length -1;
	
}

function renumberNewPackRows() {
    const elements = document.querySelectorAll('#newpacknum');
    elements.forEach((element, index) => {
        element.innerHTML = index + 1;
    });
}


function saveNewPackToLocalStorage() {
    const table = document.getElementById("sqqcreate");
    const rows = [];
    
    // Skip header row by starting at index 1
    for (let i = 1; i < table.rows.length; i++) {
        rows.push(table.rows[i].cells[3].dataxml);
    }
    
    localStorage.setItem(questionPackType + 'NewPack', JSON.stringify(rows));
}

function loadNewPackFromLocalStorage() {
    const savedPack = localStorage.getItem(questionPackType + 'NewPack');
    if (savedPack) {
        const rows = JSON.parse(savedPack);
        rows.forEach(xmlString => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
            addQuestionToNewPack({ parentElement: { dataxml: xmlString } });
        });
    }
}