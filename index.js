/*--Initial----------------------------------------------------------------------------------------------------------------------------------------*/
// window.oncontextmenu = (e)=>{e.preventDefault()}
window.onload = initLoad;

function initLoad(){
    document.querySelector("#canvas-w").value = screen.width;
    document.querySelector("#canvas-h").value = 500;
    document.querySelector("#tree-text").value = "";
    resizeCanvas();

    document.querySelector("#reset").onclick = reset;
    document.querySelector("#build-tree").onclick = buildTree;
    document.querySelector("#change-size").onclick = resizeCanvas;
    document.querySelector(".steps").innerHTML = "Spremno!";
}
function resizeCanvas(gameData){
    let w = document.querySelector("#canvas-w").value;
    let h = document.querySelector("#canvas-h").value;
    if(!w) alert("Pogresna velicina canvasa");
    else if(!h) alert("Pogresna velicina canvasa");
    else{
        w = parseInt(w);
        h = parseInt(h);
        if(w <= 0 || w > 2000) alert("Canvas mora biti 0 and smaller then 2000");
        else if(h <= 0 || h > 2000) alert("Canvas mora biti 0 and smaller then 2000");
        else{
            document.documentElement.style.setProperty("--canvas-height", h+"px");
            let animCanvas = document.querySelector("#anim-canvas");
            animCanvas.height = h;
            animCanvas.width = w;
            if(gameData) drawCanvas(gameData);
        }
    }
}

/*--Tree Controls----------------------------------------------------------------------------------------------------------------------------------*/
function buildTree(){
    let steps = document.querySelector(".steps");
    let treeText = document.querySelector("#tree-text");
    if(!treeText.value) alert("Morate unijeti tekst da biste izgradili stablo!");
    else{
        let allChars = [];
        for(let i = 0; i < treeText.value.length; i++){
            let charFound = false;
            for(let j = 0; j < allChars.length; j++){
                if(allChars[j].label === treeText.value[i]){
                    allChars[j].value++;
                    charFound = true;
                    break;
                }
            }
            if(!charFound){
                allChars.push({
                    value:1,
                    label:treeText.value[i],
                    finalX:0,finalY:0,currX:0,currY:0,
                    left:null,right:null,
                    outline:false,
                    depth:0,
                });
            }
        }
        allChars.sort((a,b)=>{return a.value - b.value});
        for(let i = 0; i < allChars.length; i++){
            allChars[i].finalX = i*50;
            allChars[i].currX = i*50
        }
        let gameData = {
            nodesToCheck:allChars.length,
            allChars:allChars,
            addX:50,diffX:0,
            totalDepth:0
        };
        steps.innerHTML = "Prvo odvajamo sve znakove na temelju njihove učestalosti pojavljivanja<br>";
        drawCanvas(gameData);
        setTimeout(()=>{
            if(gameData.allChars.length > 1) chooseBottomTwo(gameData);
            else{
                steps.innerHTML += "Stablo je napravljeno!";
                console.log("Konacno stablo je: ",gameData.allChars[0]);
                document.querySelector(".mask").style.display = "none";
            }
        },animSpeed());
        document.querySelector("#change-size").onclick = ()=>{resizeCanvas(gameData)};
        document.querySelector(".mask").style.display = "block";
    }
}
function chooseBottomTwo(gameData){
    let bottom = [];
    for(let i = 0; i < gameData.allChars.length; i++){
        if(bottom.length < 2) bottom.push(i);
        else{
            if(gameData.allChars[i].value < gameData.allChars[bottom[0]].value) bottom[0] = i;
            else if(gameData.allChars[i].value < gameData.allChars[bottom[1]].value) bottom[1] = i;
        }
    }
    bottom.sort((a,b)=>{return gameData.allChars[a].value-gameData.allChars[b].value});
    if(bottom.length === 2){
        gameData.allChars[bottom[0]].outline = true;
        gameData.allChars[bottom[1]].outline = true;
        drawCanvas(gameData);
        let nodeName1 = gameData.allChars[bottom[0]].label;
        let nodeName2 = gameData.allChars[bottom[1]].label;
        if(nodeName1 === "") nodeName1 = gameData.allChars[bottom[0]].value;
        if(nodeName2 === "") nodeName2 = gameData.allChars[bottom[1]].value;
        document.querySelector(".steps").innerHTML += "Biramo dva čvora s najmanjom vrijednošću, a to su čvorovi <b> '"+nodeName1+"'</b> i <b>'"+nodeName2+"'</b><br>";
        setTimeout(()=>{combineBottomTwo(gameData,bottom)},animSpeed());
    }
}
function combineBottomTwo(gameData,bottom){
    let steps = document.querySelector(".steps");
    let leftNode = JSON.parse(JSON.stringify(gameData.allChars[bottom[0]]));
    let rightNode = JSON.parse(JSON.stringify(gameData.allChars[bottom[1]]));
    rightNode.currX = rightNode.currX-gameData.allChars[bottom[0]].currX;
    leftNode.currX = leftNode.currX-gameData.allChars[bottom[0]].currX;
    rightNode.depth++;
    leftNode.depth++;

    let leftChildren = [], rightChildren = [];
    if(leftNode.left){
        leftChildren.push(leftNode.left);
        while(leftChildren.length > 0){
            let currChild = leftChildren.shift();
            currChild.depth++;
            if(currChild.depth > gameData.totalDepth) gameData.totalDepth = currChild.depth;
            if(currChild.left) leftChildren.push(currChild.left);
            if(currChild.right) leftChildren.push(currChild.right);
        }
    }
    if(leftNode.right){
        rightChildren.push(leftNode.right);
        while(rightChildren.length > 0){
            let currChild = rightChildren.shift();
            currChild.depth++;
            if(currChild.depth > gameData.totalDepth) gameData.totalDepth = currChild.depth;
            if(currChild.left) rightChildren.push(currChild.left);
            if(currChild.right) rightChildren.push(currChild.right);
        }
    }
    if(rightNode.left){
        rightChildren.push(rightNode.left);
        while(rightChildren.length > 0){
            let currChild = rightChildren.shift();
            currChild.depth++;
            if(currChild.depth > gameData.totalDepth) gameData.totalDepth = currChild.depth;
            if(currChild.left) rightChildren.push(currChild.left);
            if(currChild.right) rightChildren.push(currChild.right);
        }
    }
    if(rightNode.right){
        rightChildren.push(rightNode.right);
        while(rightChildren.length > 0){
            let currChild = rightChildren.shift();
            currChild.depth++;
            if(currChild.depth > gameData.totalDepth) gameData.totalDepth = currChild.depth;
            if(currChild.left) rightChildren.push(currChild.left);
            if(currChild.right) rightChildren.push(currChild.right);
        }
    }

    rightNode.finalY = 75;
    rightNode.finalX = 25*(gameData.totalDepth+1);
    leftNode.finalY = 75;
    leftNode.finalX = -25*(gameData.totalDepth+1);

    let newNode = {
        value:gameData.allChars[bottom[0]].value + gameData.allChars[bottom[1]].value,
        finalY:gameData.allChars[bottom[0]].currY,
        currX:gameData.allChars[bottom[0]].currX,
        currY:gameData.allChars[bottom[0]].currY,
        right:rightNode,left:leftNode,
        outline:false,label:"",depth:0
    }

    steps.innerHTML += "Dodajemo novi čvor s vrijednošću<b> "+(leftNode.value + rightNode.value)+"</b>";
    steps.innerHTML += " cija ce djeca biti odabrani cvorovi<br>";

    if(bottom[0] === 0) gameData.diffX = (gameData.totalDepth+1)*25;
    gameData.nodesToCheck--;
    gameData.allChars.splice(bottom[1],1);
    gameData.allChars.splice(bottom[0],1);
    gameData.allChars.push(newNode);
    gameData.allChars.sort((a,b)=>{return a.value - b.value});
    for(let i = 0; i < gameData.allChars.length; i++) gameData.allChars[i].finalX = i*50;
    
    let allDone;
    interval = setInterval(()=>{
        allDone = true;
        if(gameData.diffX > 0){
            allDone = false;
            gameData.diffX--;
            gameData.addX++
        }
        for(let i = 0; i < gameData.allChars.length; i++){
            if(gameData.allChars[i].currX != gameData.allChars[i].finalX){
                allDone = false;
                if(gameData.allChars[i].finalX > gameData.allChars[i].currX) gameData.allChars[i].currX++; 
                else gameData.allChars[i].currX--;
            }
            let childNodes = [];
            if(gameData.allChars[i].left) childNodes.push(gameData.allChars[i].left);
            if(gameData.allChars[i].right) childNodes.push(gameData.allChars[i].right);
            while(childNodes.length > 0){
                let currNode = childNodes.shift();
                let leftEqual = false, rightEqual = false;
                if(currNode.finalX != currNode.currX){
                    if(currNode.finalX < currNode.currX) currNode.currX--;
                    else currNode.currX++;
                    allDone = false;
                }
                else leftEqual = true;
                if(currNode.finalY != currNode.currY){
                    if(currNode.finalY < currNode.currY) currNode.currY--;
                    else currNode.currY++;
                    allDone = false;
                }
                else rightEqual = true;
                if(leftEqual && rightEqual) currNode.outline = false;
                if(currNode.left) childNodes.push(currNode.left);
                if(currNode.right) childNodes.push(currNode.right);
            }
        }
        if(allDone){
            clearInterval(interval);
            if(gameData.nodesToCheck > 1) setTimeout(()=>{chooseBottomTwo(gameData)},animSpeed());
            else{
                steps.innerHTML += "Stablo je napravljeno!";
                console.log("Konacno stablo je: ",gameData.allChars[0]);
                document.querySelector(".mask").style.display = "none";
            }
        }
        drawCanvas(gameData);
    },animSpeed()/50);   
}
function drawCanvas(gameData){
    let animCanvas = document.querySelector("#anim-canvas");
    let ctx = animCanvas.getContext("2d");
    ctx.clearRect(0,0,animCanvas.width,animCanvas.height);

    for(let i = 0; i < gameData.allChars.length; i++){
        let childNodes = [];
        if(gameData.allChars[i].left){
            let newLeftNode = JSON.parse(JSON.stringify(gameData.allChars[i].left));
            newLeftNode.currX += gameData.allChars[i].currX;
            newLeftNode.currY += gameData.allChars[i].currY;
            newLeftNode.parentCoords = [gameData.allChars[i].currX,gameData.allChars[i].currY];
            childNodes.push(newLeftNode);
        }
        if(gameData.allChars[i].right){
            let newRightNode = JSON.parse(JSON.stringify(gameData.allChars[i].right));
            newRightNode.currX += gameData.allChars[i].currX;
            newRightNode.currY += gameData.allChars[i].currY;
            newRightNode.parentCoords = [gameData.allChars[i].currX,gameData.allChars[i].currY];
            childNodes.push(newRightNode);
        }
        while(childNodes.length > 0){
            let currNode = childNodes.shift();
            ctx.beginPath();
            ctx.strokeStyle = "rgb(255,255,255)";
            ctx.moveTo(
                gameData.addX+currNode.parentCoords[0],
                50+currNode.parentCoords[1]
            );
            ctx.lineTo(
                gameData.addX+currNode.currX,
                50+gameData.allChars[i].currY+currNode.currY
            );
            ctx.stroke();
            ctx.closePath();

            if(currNode.left){
                let newChildLeftNode = JSON.parse(JSON.stringify(currNode.left));
                newChildLeftNode.currX += currNode.currX;
                newChildLeftNode.currY += currNode.currY;
                newChildLeftNode.parentCoords = [currNode.currX,currNode.currY];
                childNodes.push(newChildLeftNode);
            }
            if(currNode.right){
                let newChildRightNode = JSON.parse(JSON.stringify(currNode.right));
                newChildRightNode.currX += currNode.currX;
                newChildRightNode.currY += currNode.currY;
                newChildRightNode.parentCoords = [currNode.currX,currNode.currY];
                childNodes.push(newChildRightNode);
            }
        }
    }

    for(let i = 0; i < gameData.allChars.length; i++){
        let childNodes = [];
        if(gameData.allChars[i].left){
            let newLeftNode = JSON.parse(JSON.stringify(gameData.allChars[i].left));
            newLeftNode.currX += gameData.allChars[i].currX;
            newLeftNode.currY += gameData.allChars[i].currY;
            newLeftNode.parentCoords = [gameData.allChars[i].currX,gameData.allChars[i].currY];
            childNodes.push(newLeftNode);
        }
        if(gameData.allChars[i].right){
            let newRightNode = JSON.parse(JSON.stringify(gameData.allChars[i].right));
            newRightNode.currX += gameData.allChars[i].currX;
            newRightNode.currY += gameData.allChars[i].currY;
            newRightNode.parentCoords = [gameData.allChars[i].currX,gameData.allChars[i].currY];
            childNodes.push(newRightNode);
        }
        while(childNodes.length > 0){
            let currNode = childNodes.shift();

            ctx.beginPath();
            ctx.fillStyle = "rgb(35,35,35)";
            if(currNode.outline) ctx.strokeStyle = "rgb(255,0,0)";
            else ctx.strokeStyle = "rgb(255,255,255)";
            ctx.arc(
                gameData.addX+currNode.currX,
                50+gameData.allChars[i].currY+currNode.currY,
                20,0,2*Math.PI
            );
            ctx.fill();
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            ctx.textAlign = "center"; 
            ctx.textBaseline = "middle"; 
            ctx.fillStyle = "rgb(255,255,255)";
            let text = currNode.label+" ("+currNode.value+")";
            if(currNode.label === "") text = currNode.value;
            ctx.font = "11px Arial";
            ctx.fillText(text,gameData.addX+currNode.currX,50+gameData.allChars[i].currY+currNode.currY);
            ctx.closePath();

            if(currNode.left){
                let newChildLeftNode = JSON.parse(JSON.stringify(currNode.left));
                newChildLeftNode.currX += currNode.currX;
                newChildLeftNode.currY += currNode.currY;
                newChildLeftNode.parentCoords = [currNode.currX,currNode.currY];
                childNodes.push(newChildLeftNode);
            }
            if(currNode.right){
                let newChildRightNode = JSON.parse(JSON.stringify(currNode.right));
                newChildRightNode.currX += currNode.currX;
                newChildRightNode.currY += currNode.currY;
                newChildRightNode.parentCoords = [currNode.currX,currNode.currY];
                childNodes.push(newChildRightNode);
            }
        }  
    }

    for(let i = 0; i < gameData.allChars.length; i++){
        ctx.beginPath();
        ctx.fillStyle = "rgb(35,35,35)";
        if(gameData.allChars[i].outline) ctx.strokeStyle = "rgb(255,0,0)";
        else ctx.strokeStyle = "rgb(255,255,255)";
        ctx.arc(
            gameData.addX+gameData.allChars[i].currX,
            50+gameData.allChars[i].currY,
            20,0,2*Math.PI
        );
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        ctx.beginPath();
        ctx.textAlign = "center"; 
        ctx.textBaseline = "middle"; 
        ctx.fillStyle = "rgb(255,255,255)";
        let text = gameData.allChars[i].label+" ("+gameData.allChars[i].value+")";
        if(gameData.allChars[i].label === "") text = gameData.allChars[i].value;
        ctx.font = "11px Arial";
        ctx.fillText(text,gameData.addX+gameData.allChars[i].currX,50+gameData.allChars[i].currY);
        ctx.closePath();
    }
}
function lineAngle(cx,cy,ex,ey) {
    let dy = ey - cy;
    let dx = ex - cx;
    let theta = Math.atan2(dy, dx);
    theta *= 180 / Math.PI;
    return theta;
}
function animSpeed(){
    return 500;
}
function reset(){
    document.querySelector("#tree-text").value = "";
    document.querySelector(".steps").innerHTML = "Spremno!";
    let animCanvas = document.querySelector("#anim-canvas");
    let ctx = animCanvas.getContext("2d");
    ctx.clearRect(0,0,animCanvas.width,animCanvas.height);
}