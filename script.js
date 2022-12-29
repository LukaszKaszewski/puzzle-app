let locationInfo = document.querySelector(".coordinates");
let rasterMap = document.getElementById("rasterMap");
let map = L.map('map').setView([53.43, 14.55], 16);
let imageSrc;
let random;

const localBtn = document.querySelector("#getLocation");
const saveMapBtn = document.querySelector("#saveButton");
const puzzleBtn = document.querySelector("#makePuzzle");

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// starting button status
saveMapBtn.setAttribute('disabled', true);
puzzleBtn.setAttribute('disabled', true);

// get Your location
document.getElementById("getLocation").addEventListener("click", function(event) {
    if (! navigator.geolocation) {
        console.log("No geolocation.");
    }

    let tablePid = document.getElementById("tableP");
    tablePid.textContent = "";

    if (document.contains(document.getElementById("winThis"))) {
        let win = document.getElementById("winThis");
        win.remove();
    }



    navigator.geolocation.getCurrentPosition(position => {
        console.log(position);
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;

        map.setView([lat, lon]);
        L.marker([lat, lon]).addTo(map);
        let latdeg;
        let londeg;

        if (lat < 0) {
            latdeg = 'S';
            lat *= (-1);
        } else {
            latdeg = 'N'
        }

        if (lon < 0) {
            londeg = 'W';
            lon *= (-1);
        } else {
            londeg = 'E';
        }

        locationInfo.innerHTML = "Latitude: " + lat + " <strong>°</strong>" + latdeg + "<br>Longitude: " + lon + " <strong>°</strong>" + londeg;

    }, positionError => {
        console.error(positionError);
    });

    localBtn.setAttribute('disabled', true);
    saveMapBtn.removeAttribute('disabled');
});

// show static map (second div (window))
document.getElementById("saveButton").addEventListener("click", function() {
    leafletImage(map, function (err, canvas) {
        let tablePid = document.getElementById("tableP");
        tablePid.textContent = "";

        const img = new Image();
        let dimensions = map.getSize();
        img.width = dimensions.x;
        img.height = dimensions.y;
        img.src = canvas.toDataURL();
        document.querySelector('.maps').appendChild(img);
        img.setAttribute('id', 'rasterMap');
        imageSrc = canvas.toDataURL();
    });

    saveMapBtn.setAttribute('disabled', true);
    setTimeout(() => {
        puzzleBtn.removeAttribute('disabled');
    }, 1000);

});

// split image, shuffle pieces, create table with pieces
document.getElementById("makePuzzle").addEventListener("click", function() {
    leafletImage(map, function (err) {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext("2d");
        let parts = [];

        let img = new Image();
        img.src = imageSrc;
        img.onload = splitImg;

        // split image
        function splitImg() {
            let w2 = img.width/4;
            let h2 = img.height/4;

            for (let i = 0; i < 16; i++) {
                let x = (-w2 * i) % (w2*4);
                let y = (-h2 * i) > -h2*4? 0 :
                        (-h2 * i) > -h2*8? -100 :
                        (-h2 * i) > -h2*12? -200 : -300;

                 canvas.width = w2;
                 canvas.height = h2;

                 ctx.drawImage(img, x, y, w2 * 4, h2 * 4);

                 parts.push(canvas.toDataURL());
             }

            // shuufle function
            function shuffle(o) {
                for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
                return o;
            }

            // shuffle pieces
            let uniqNumbers = Array.from(Array(16).keys());
            random = shuffle(uniqNumbers);

            // set table with pieces
            for (let i = 0; i < 16 ; i++) {
                let slicedImage = document.createElement('img');
                slicedImage.setAttribute("id", "pcs"+i);
                slicedImage.setAttribute("draggable", "true");
                slicedImage.setAttribute("ondragstart", "drag(event)");
                slicedImage.setAttribute("class", "pieces");
                slicedImage.src = parts[random[i]];
                let div = document.getElementById('tableP');
                div.appendChild(slicedImage);
            }
        }
    });

    // hide and add new area
    if (document.contains(document.querySelector(".maps"))) {
        let lastChld = document.querySelector(".maps");
        lastChld.removeChild(lastChld.lastChild);
    }

    // new window to merge puzzle
    let makeWin = document.createElement("div");
    let winMap = document.querySelector(".maps");
    winMap.appendChild(makeWin);
    makeWin.setAttribute("id", "winThis");

    // subwindows to pieces
    for (let i = 0; i < 16; i++) {
        let newRasterMap = document.createElement("span");
        let divMaps = document.querySelector("#winThis");
        divMaps.append(newRasterMap);
        newRasterMap.setAttribute("id", "drag"+i);
        newRasterMap.setAttribute("ondrop", "drop(event)");
        newRasterMap.setAttribute("ondragover", "allowDrop(event)");
        newRasterMap.setAttribute("class", "drag");
    }
    puzzleBtn.setAttribute('disabled', true);
});

// helper functions
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));

    checkPuzzle();
}

// function to check result
function checkPuzzle() {
    let tablePid = document.getElementById("tableP");

    if (tablePid.children.length == 0) {
        let counter = 0;
        for (let i = 0; i < 16; i++) {
            let imgParentId = document.querySelector("#pcs"+i).parentNode.id;
            let goodPossition = "drag" + random[i];

            // check correct possition
            if (imgParentId == goodPossition) {
                counter++;
                console.log(counter);
            }

            // if (16) all picture is done
            if (counter == 16) {
                tablePid.textContent = "You did it great!!!";
                localBtn.removeAttribute('disabled');
            } else {
                tablePid.textContent = "Was close, but something went wrong :(";
                localBtn.removeAttribute('disabled');
            }
        }
    }
}