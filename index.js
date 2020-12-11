const JsonLdParser = require("jsonld-streaming-parser").JsonLdParser;
const fs = require("fs");

var boxesId=[];
var boxes=[];
var foundID = false;


/*var box={
    id: "",
    backgroundColor: "",
    posX: "",
    posY: "",
    widht: "",
    height: "",
    belongsTo:"",
    color:"",
    documentOrder:"",
    fontFamily:"",
    fontSize:"",
    fontStyle:"",
    fontWeight:"",
    hasAttribute:"",
    htmlTagName:"",
    lineThrough:"",
    underline:"",
    visualHeight:"",
    visualWidth:"",
    visualX:"",
    visualY:"",
    type:""
}*/

function main(){
     console.log(boxes);
     //console.log(boxesId);
     for(var i = 0; i<boxes.length;i++){
         //for(var j =0; j<boxesId.length;j++){
         //    if(boxes[i].id==boxesId[j]){
                 
                 const d = document.createElement('box-element');
            d.innerHTML = `
            <box-element style="position: absolute; top: `+ boxes[i].posY +`px; left: `+ boxes[i].posX +`px; width: `+ boxes[i].widht +
            `px; height: `+ boxes[i].height +`px; background-color:#`+ boxes[i].backgroundColor +`; color:#`+ boxes[i].color +`; font-size:`+
            boxes[i].fontSize +`px; font-weight: `+ boxes[i].fontWeight +`; font-family:`+ boxes[i].fontFamily +`; font-style: `+ boxes[i].fontStyle +`;
             border-left:`+ boxes[i].borderL.borderWidth +`px `+ boxes[i].borderL.borderStyle +` #`+ boxes[i].borderL.borderColor +`;
             border-right:`+ boxes[i].borderR.borderWidth +`px `+ boxes[i].borderR.borderStyle +` #`+ boxes[i].borderR.borderColor +`;
             border-top:`+ boxes[i].borderT.borderWidth +`px `+ boxes[i].borderT.borderStyle +` #`+ boxes[i].borderT.borderColor +`;
             border-bottom:`+ boxes[i].borderB.borderWidth +`px `+ boxes[i].borderB.borderStyle +` #`+ boxes[i].borderB.borderColor +`;
              ">
            `+ boxes[i].text +`
            </box-element>
             `;
            const body = document.getElementById("body");
            body.appendChild(d);
         //    }
       //  }
     
     }

}

function saveObject(data){
    //console.log(data);
    var object = data.object.value;
    var lastIndexO = object.lastIndexOf('#')+1;
    var value = object.substr(lastIndexO,object.lenght);

    var subject = data.subject.value;
    var lastIndexS = subject.lastIndexOf('/')+1;
    var id = subject.substr(lastIndexS,subject.lenght);
    var borderS = "";

    if(id.includes("Btop")){
        id = id.replace('Btop','');
        borderS = "top";
    }
    if(id.includes("Bbottom")){
        id = id.replace('Bbottom','');
        borderS = "bottom";
    }
    if(id.includes("Bleft")){
        id = id.replace('Bleft','');
        borderS = "left";
    }
    if(id.includes("Bright")){
        id = id.replace('Bright','');
        borderS = "right";
    }

    if(value== "Box"){
        boxesId.push(id);
    }

    var predicate = data.predicate.value;
    var lastIndexP = predicate.lastIndexOf('#')+1;
    var type = predicate.substr(lastIndexP,predicate.lenght);

        for(var i = 0; i<boxes.length;i++){
            
            if(id==boxes[i].id){
                foundID = true;
                
                    if(borderS=="top"){
                    switch (type) {
                        case "borderColor": 
                        boxes[i].borderT.borderColor = value;
                        break;
                    case "borderStyle": 
                        boxes[i].borderT.borderStyle = value;
                        break;
                    case "borderWidth":
                        boxes[i].borderT.borderWidth = value;
                        break;
                    default:
                        break;
                        }
                    }
                    else if(borderS=="left"){
                    switch (type) {
                        case "borderColor": 
                        boxes[i].borderL.borderColor = value;
                        break;
                    case "borderStyle": 
                        boxes[i].borderL.borderStyle = value;
                        break;
                    case "borderWidth":
                        boxes[i].borderL.borderWidth = value;
                        break;
                    default:
                        break;
                        }
                    }
                    else if(borderS=="bottom"){
                    switch (type) {
                        case "borderColor": 
                        boxes[i].borderB.borderColor = value;
                        break;
                    case "borderStyle": 
                        boxes[i].borderB.borderStyle = value;
                        break;
                    case "borderWidth":
                        boxes[i].borderB.borderWidth = value;
                        break;
                    default:
                        break;
                        }
                    }
                    else if(borderS=="right"){
                    switch (type) {
                        case "borderColor": 
                        boxes[i].borderR.borderColor = value;
                        break;
                    case "borderStyle": 
                        boxes[i].borderR.borderStyle = value;
                        break;
                    case "borderWidth":
                        boxes[i].borderR.borderWidth = value;
                        break;
                    default:
                        break;
                        }
                    }
               
                
                switch (type) {
                    case "backgroundColor":
                        boxes[i].backgroundColor = value;                  
                        break;

                    case "positionX":
                        boxes[i].posX = value;                      
                        break;

                    case "positionY":
                        boxes[i].posY = value;
                        break;

                    case "width":
                        boxes[i].widht = value; 
                        break;

                    case "height":
                        boxes[i].height = value;
                        break;

                    case "belongsTo":
                        boxes[i].belongsTo = value;
                        break;
                    
                    case "color":
                        boxes[i].color = value;
                        break;
                    
                    case "documentOrder":
                        boxes[i].documentOrder = value;
                        break;    
                    
                    case "fontFamily":
                        boxes[i].fontFamily = value;
                        break;

                    case "fontSize":
                        boxes[i].fontSize = value;
                        break;

                    case "fontStyle":
                        boxes[i].fontStyle = value;
                        break;

                    case "fontWeight":
                        if(value > 0,5){
                            boxes[i].fontWeight = "bold";
                        }
                        else{
                            boxes[i].fontWeight = "normal";
                        }
                        
                        break;

                    case "hasAttribute":
                        boxes[i].hasAttribute = value;
                        break;

                    case "htmlTagName":
                        boxes[i].htmlTagName = value;
                        break;
                    
                    case "lineTrough":
                        boxes[i].lineTrough = value;
                        break;

                    case "underLine":
                        boxes[i].underLine = value;
                        break;

                    case "visualHeight":
                        boxes[i].visualHeight = value;
                        break;

                    case "visualWidth":
                        boxes[i].visualWidth = value;
                        break;

                    case "visualX":
                        boxes[i].visualX = value;
                        break;

                    case "visualY":
                        boxes[i].visualY = value;
                        break;

                    case "type":
                        boxes[i].type = value;
                        break;

                    case "isChildOf":
                        boxes[i].isChildOf = value;
                        break;
                    
                    case "hasText":
                        boxes[i].text = value;
                        break;

                    default:
                        break;
                }
            }
        }

        if(foundID == false){
            var O ={id: id,
                    backgroundColor: "",
                    posX: "",
                    posY: "",
                    widht: "",
                    height: "",
                    belongsTo:"",
                    color:"",
                    documentOrder:"",
                    fontFamily:"",
                    fontSize:"",
                    fontStyle:"",
                    fontWeight:"",
                    hasAttribute:"",
                    htmlTagName:"",
                    lineThrough:"",
                    underline:"",
                    visualHeight:"",
                    visualWidth:"",
                    visualX:"",
                    visualY:"",
                    type:"",
                    isChildOf:"",
                    text:"",
                    borderL : 
                    {
                    borderColor:"",
                    borderWidth:"",
                    borderStyle:""},
                    borderR : 
                    {
                    borderColor:"",
                    borderWidth:"",
                    borderStyle:""},
                    borderT : 
                    {
                    borderColor:"",
                    borderWidth:"",
                    borderStyle:""},
                    borderB : 
                    {
                    borderColor:"",
                    borderWidth:"",
                    borderStyle:""}
                    }

                    if(borderS){
                        O.border.side=borderS;
                        switch (type) {
                            case "borderColor": 
                            O.border.borderColor = value;
                            break;
                        case "borderStyle": 
                            O.border.borderStyle = value;
                            break;
                        case "borderWidth":
                            O.border.borderWidth = value;
                            break;
                        default:
                            break;
                        }
                    }

            switch (type) {
                case "backgroundColor":
                    O.backgroundColor = value;                  
                    break;

                case "positionX":
                    O.posX = value;                      
                    break;

                case "positionY":
                    O.posY = value;
                    break;

                case "width":
                    O.widht = value; 
                    break;

                case "height":
                    O.height = value;
                    break;

                case "belongsTo":
                    O.belongsTo = value;
                    break;
                
                case "color":
                    O.color = value;
                    break;
                
                case "documentOrder":
                    O.documentOrder = value;
                    break;    
                
                case "fontFamily":
                    O.fontFamily = value;
                    break;

                case "fontSize":
                    O.fontSize = value;
                    break;

                case "fontStyle":
                    O.fontStyle = value;
                    break;

                case "fontWeight":
                    O.fontWeight = value;
                    break;

                case "hasAttribute":
                    O.hasAttribute = value;
                    break;

                case "htmlTagName":
                    O.htmlTagName = value;
                    break;
                
                case "lineTrough":
                    O.lineTrough = value;
                    break;

                case "underLine":
                    O.underLine = value;
                    break;

                case "visualHeight":
                    O.visualHeight = value;
                    break;

                case "visualWidth":
                    O.visualWidth = value;
                    break;

                case "visualX":
                    O.visualX = value;
                    break;

                case "visualY":
                    O.visualY = value;
                    break;

                case "type":
                    O.type = value;
                    break;

                case "isChildOf":
                    O.type = value;
                    break;
                case "hasText":
                    O.text = value;
                    break;
                

                default:
                    break;
            }
                boxes.push(O);
        }

        foundID = false;
}


const myParser = new JsonLdParser();

myParser
  .on('data', saveObject)
  .on('error', console.error)
  .on('end', main);


myParser.write(`
    {
        "@graph": [
            {
                "@id": "r:art4",
                "@type": "b:Page",
                "b:hasTitle": "CSSBox - Java HTML rendering engine",
                "b:launchDatetime": {
                    "@type": "xsd:dateTime",
                    "@value": "2020-10-16T09:14:13.840+02:00"
                },
                "b:sourceUrl": "http://cssbox.sf.net"
            },
            {
                "@id": "r:art4#0",
                "@type": "b:Box",
                "b:backgroundColor": "#fafafa",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#000000",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "0"
                },
                "b:fontFamily": "Serif",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "12.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasAttribute": [
                    {
                        "@id": "r:art4#0-attr-class"
                    },
                    {
                        "@id": "r:art4#0-attr-style"
                    }
                ],
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "878"
                },
                "b:htmlTagName": "xdiv",
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "0"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "0"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "878"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "1200"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "0"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "0"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "1200"
                }
            },
            {
                "@id": "r:art4#0-attr-class",
                "rdf:value": "Xanonymous",
                "rdfs:label": "class"
            },
            {
                "@id": "r:art4#0-attr-style",
                "rdf:value": "display:block",
                "rdfs:label": "style"
            },
            {
                "@id": "r:art4#1",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#000000",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "1"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "10.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "863"
                },
                "b:htmlTagName": "body",
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "8"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "8"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "0"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "0"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "8"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "8"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "1184"
                }
            },
            {
                "@id": "r:art4#10",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#343434",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "10"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "10.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasAttribute": [
                    {
                        "@id": "r:art4#10-attr-style"
                    },
                    {
                        "@id": "r:art4#10-attr-href"
                    }
                ],
                "b:hasText": "more...",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "994"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "176"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "1.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "41"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "994"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "176"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "41"
                }
            },
            {
                "@id": "r:art4#10-attr-href",
                "rdf:value": "about.php",
                "rdfs:label": "href"
            },
            {
                "@id": "r:art4#10-attr-style",
                "rdf:value": "margin-left: 1em",
                "rdfs:label": "style"
            },
            {
                "@id": "r:art4#11",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#343434",
                "b:containsImage": {
                    "@id": "urn:uuid:c36f2a79-f01d-43bd-8d90-bb55a2d89409"
                },
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "11"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "10.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasAttribute": [
                    {
                        "@id": "r:art4#11-attr-src"
                    },
                    {
                        "@id": "r:art4#11-attr-href"
                    }
                ],
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "20"
                },
                "b:htmlTagName": "img",
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "606"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "234"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "20"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "20"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "606"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "234"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "20"
                }
            },
            {
                "@id": "r:art4#11-attr-href",
                "rdf:value": "http://a.fsdn.com/con/app/proj/cssbox/screenshots/browser1.jpeg",
                "rdfs:label": "href"
            },
            {
                "@id": "r:art4#11-attr-src",
                "rdf:value": "http://a.fsdn.com/con/app/proj/cssbox/screenshots/browser1.jpeg/182/137",
                "rdfs:label": "src"
            },
            {
                "@id": "r:art4#12",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#000000",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "12"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "10.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasAttribute": {
                    "@id": "r:art4#12-attr-class"
                },
                "b:hasText": " ",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "639"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "242"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "4"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "639"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "242"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "4"
                }
            },
            {
                "@id": "r:art4#12-attr-class",
                "rdf:value": "screenshots",
                "rdfs:label": "class"
            },
            {
                "@id": "r:art4#13",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#343434",
                "b:containsImage": {
                    "@id": "urn:uuid:eac14358-2f44-4e85-9c18-3ca7eddc9cb8"
                },
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "10.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasAttribute": [
                    {
                        "@id": "r:art4#13-attr-src"
                    },
                    {
                        "@id": "r:art4#13-attr-href"
                    }
                ],
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "20"
                },
                "b:htmlTagName": "img",
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "657"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "234"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "20"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "20"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "657"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "234"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "20"
                }
            },
            {
                "@id": "r:art4#13-attr-href",
                "rdf:value": "http://a.fsdn.com/con/app/proj/cssbox/screenshots/318269.jpg",
                "rdfs:label": "href"
            },
            {
                "@id": "r:art4#13-attr-src",
                "rdf:value": "http://a.fsdn.com/con/app/proj/cssbox/screenshots/318269.jpg/182/137",
                "rdfs:label": "src"
            },
            {
                "@id": "r:art4#14",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#000000",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "14"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "10.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasAttribute": {
                    "@id": "r:art4#14-attr-class"
                },
                "b:hasText": " ",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "690"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "242"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "4"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "690"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "242"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "4"
                }
            },
            {
                "@id": "r:art4#14-attr-class",
                "rdf:value": "screenshots",
                "rdfs:label": "class"
            },
            {
                "@id": "r:art4#15",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#343434",
                "b:containsImage": {
                    "@id": "urn:uuid:3f0ff03f-38e0-42df-9500-7064fceea9ac"
                },
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "15"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "10.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasAttribute": [
                    {
                        "@id": "r:art4#15-attr-src"
                    },
                    {
                        "@id": "r:art4#15-attr-href"
                    }
                ],
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "20"
                },
                "b:htmlTagName": "img",
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "707"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "234"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "20"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "20"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "707"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "234"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "20"
                }
            },
            {
                "@id": "r:art4#15-attr-href",
                "rdf:value": "http://a.fsdn.com/con/app/proj/cssbox/screenshots/318271.jpg",
                "rdfs:label": "href"
            },
            {
                "@id": "r:art4#15-attr-src",
                "rdf:value": "http://a.fsdn.com/con/app/proj/cssbox/screenshots/318271.jpg/182/137",
                "rdfs:label": "src"
            },
            {
                "@id": "r:art4#16",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#000000",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "12.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "1.0"
                },
                "b:hasText": "Latest News",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "19"
                },
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "207"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "297"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "19"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "94"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "207"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "297"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "94"
                }
            },
            {
                "@id": "r:art4#17",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#000000",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "17"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "8.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasAttribute": {
                    "@id": "r:art4#17-attr-class"
                },
                "b:hasText": "Fri, 01 Nov 2019 08:56:37 -0000",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "208"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "334"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "155"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "208"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "334"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "155"
                }
            },
            {
                "@id": "r:art4#17-attr-class",
                "rdf:value": "date",
                "rdfs:label": "class"
            },
            {
                "@id": "r:art4#18",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#000000",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "18"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "10.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "1.0"
                },
                "b:hasText": "jStyleParser 3.5 released",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "208"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "349"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "158"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "208"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "349"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "158"
                }
            },
            {
                "@id": "r:art4#19",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#000000",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "19"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "10.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasText": "The processing of the counter-related properties has been reworked and fixed.",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "215"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "370"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "448"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "215"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "370"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "448"
                }
            },
            {
                "@id": "r:art4#2",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#000000",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "2"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "12.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "1.0"
                },
                "b:hasLeftBorder": {
                    "@id": "r:art4#2Bleft"
                },
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "21"
                },
                "b:htmlTagName": "h2",
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "195"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "296"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "21"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "12"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "195"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "296"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "944"
                }
            },
            {
                "@id": "r:art4#20",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#000000",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "20"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "8.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasAttribute": {
                    "@id": "r:art4#20-attr-class"
                },
                "b:hasText": "Wed, 30 Oct 2019 09:24:47 -0000",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "208"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "407"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "163"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "208"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "407"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "163"
                }
            },
            {
                "@id": "r:art4#20-attr-class",
                "rdf:value": "date",
                "rdfs:label": "class"
            },
            {
                "@id": "r:art4#21",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#000000",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "21"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "10.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "1.0"
                },
                "b:hasText": "jStyleParser 3.4 released",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "208"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "421"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "158"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "208"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "421"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "158"
                }
            },
            {
                "@id": "r:art4#22",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#000000",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "22"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "10.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasText": "The new release contains logging optimizations and some minor bugfixes.",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "215"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "442"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "426"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "215"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "442"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "426"
                }
            },
            {
                "@id": "r:art4#23",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#000000",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "23"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "8.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasAttribute": {
                    "@id": "r:art4#23-attr-class"
                },
                "b:hasText": "Fri, 24 May 2019 10:47:44 -0000",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "208"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "479"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "156"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "208"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "479"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "156"
                }
            },
            {
                "@id": "r:art4#23-attr-class",
                "rdf:value": "date",
                "rdfs:label": "class"
            },
            {
                "@id": "r:art4#24",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#000000",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "24"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "10.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "1.0"
                },
                "b:hasText": "CSSBox 4.15 released",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "208"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "494"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "140"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "208"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "494"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "140"
                }
            },
            {
                "@id": "r:art4#25",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#000000",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "25"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "10.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasText": "This release finally introduces the text-align: center support, letter-spacing and word-spacing support and many fixes in SVG generation.",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "215"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "515"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "785"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "215"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "515"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "785"
                }
            },
            {
                "@id": "r:art4#26",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#000000",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "26"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "8.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasAttribute": {
                    "@id": "r:art4#26-attr-class"
                },
                "b:hasText": "Fri, 24 May 2019 09:27:18 -0000",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "208"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "552"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "156"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "208"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "552"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "156"
                }
            },
            {
                "@id": "r:art4#26-attr-class",
                "rdf:value": "date",
                "rdfs:label": "class"
            },
            {
                "@id": "r:art4#27",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#000000",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "27"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "10.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "1.0"
                },
                "b:hasText": "jStyleParser 3.3 released",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "208"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "566"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "158"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "208"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "566"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "158"
                }
            },
            {
                "@id": "r:art4#28",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#000000",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "28"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "10.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasText": "The new release contains an improved support of animations, transitions, flex and grid layout and type-safe functions.",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "215"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "587"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "675"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "215"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "587"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "675"
                }
            },
            {
                "@id": "r:art4#29",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#000000",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "29"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "8.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasAttribute": {
                    "@id": "r:art4#29-attr-class"
                },
                "b:hasText": "Tue, 30 Jan 2018 09:28:17 -0000",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "208"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "624"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "159"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "208"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "624"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "159"
                }
            },
            {
                "@id": "r:art4#29-attr-class",
                "rdf:value": "date",
                "rdfs:label": "class"
            },
            {
                "@id": "r:art4#2Bleft",
                "@type": "b:Border",
                "b:borderColor": "#ffb200",
                "b:borderStyle": "SOLID",
                "b:borderWidth": {
                    "@type": "xsd:int",
                    "@value": "8"
                }
            },
            {
                "@id": "r:art4#3",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#343434",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "3"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "24.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "1.0"
                },
                "b:hasAttribute": [
                    {
                        "@id": "r:art4#3-attr-class"
                    },
                    {
                        "@id": "r:art4#3-attr-href"
                    }
                ],
                "b:hasBottomBorder": {
                    "@id": "r:art4#3Bbottom"
                },
                "b:hasLeftBorder": {
                    "@id": "r:art4#3Bleft"
                },
                "b:hasRightBorder": {
                    "@id": "r:art4#3Bright"
                },
                "b:hasTopBorder": {
                    "@id": "r:art4#3Btop"
                },
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "41"
                },
                "b:htmlTagName": "span",
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "15"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "23"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "41"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "69"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "15"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "23"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "69"
                }
            },
            {
                "@id": "r:art4#3-attr-class",
                "rdf:value": "s1",
                "rdfs:label": "class"
            },
            {
                "@id": "r:art4#3-attr-href",
                "rdf:value": "http://cssbox.sourceforge.net/",
                "rdfs:label": "href"
            },
            {
                "@id": "r:art4#30",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#000000",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "30"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "10.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "1.0"
                },
                "b:hasText": "CSSBox 4.14 released",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "208"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "639"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "140"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "208"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "639"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "140"
                }
            },
            {
                "@id": "r:art4#31",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#000000",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "31"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "10.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasText": "The new release contains a generic font definition support, configurable image cache and some bugfixes.",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "215"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "660"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "603"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "215"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "660"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "603"
                }
            },
            {
                "@id": "r:art4#32",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#000000",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "32"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "8.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "1.0"
                },
                "b:hasText": "CSSBox",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "364"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "811"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "42"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "364"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "811"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "42"
                }
            },
            {
                "@id": "r:art4#33",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#000000",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "33"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "8.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasText": " © 2007-2019 ",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "406"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "811"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "69"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "406"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "811"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "69"
                }
            },
            {
                "@id": "r:art4#34",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#343434",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "34"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "8.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasAttribute": {
                    "@id": "r:art4#34-attr-href"
                },
                "b:hasText": "Radek Burget",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "475"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "811"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "1.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "65"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "475"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "811"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "65"
                }
            },
            {
                "@id": "r:art4#34-attr-href",
                "rdf:value": "http://www.fit.vutbr.cz/~burgetr/",
                "rdfs:label": "href"
            },
            {
                "@id": "r:art4#35",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#000000",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "35"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "8.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasText": ", ",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "540"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "811"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "6"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "540"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "811"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "6"
                }
            },
            {
                "@id": "r:art4#36",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#343434",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "36"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "8.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasAttribute": {
                    "@id": "r:art4#36-attr-href"
                },
                "b:hasText": "Faculty of Information Technology",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "546"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "811"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "1.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "161"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "546"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "811"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "161"
                }
            },
            {
                "@id": "r:art4#36-attr-href",
                "rdf:value": "http://www.fit.vutbr.cz/",
                "rdfs:label": "href"
            },
            {
                "@id": "r:art4#37",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#000000",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "37"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "8.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasText": ", ",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "707"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "811"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "6"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "707"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "811"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "6"
                }
            },
            {
                "@id": "r:art4#38",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#343434",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "38"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "8.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasAttribute": {
                    "@id": "r:art4#38-attr-href"
                },
                "b:hasText": "Brno University of Technology",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "713"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "811"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "1.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "145"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "713"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "811"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "145"
                }
            },
            {
                "@id": "r:art4#38-attr-href",
                "rdf:value": "http://www.vutbr.cz/",
                "rdfs:label": "href"
            },
            {
                "@id": "r:art4#39",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#343434",
                "b:containsImage": {
                    "@id": "urn:uuid:6e06f820-247f-4419-8691-d0b5858de546"
                },
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "39"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "8.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasAttribute": [
                    {
                        "@id": "r:art4#39-attr-alt"
                    },
                    {
                        "@id": "r:art4#39-attr-width"
                    },
                    {
                        "@id": "r:art4#39-attr-style"
                    },
                    {
                        "@id": "r:art4#39-attr-href"
                    },
                    {
                        "@id": "r:art4#39-attr-src"
                    },
                    {
                        "@id": "r:art4#39-attr-height"
                    }
                ],
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "31"
                },
                "b:htmlTagName": "img",
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "567"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "833"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "31"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "88"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "567"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "833"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "88"
                }
            },
            {
                "@id": "r:art4#39-attr-alt",
                "rdf:value": "SourceForge.net Logo",
                "rdfs:label": "alt"
            },
            {
                "@id": "r:art4#39-attr-height",
                "rdf:value": "31",
                "rdfs:label": "height"
            },
            {
                "@id": "r:art4#39-attr-href",
                "rdf:value": "http://sourceforge.net/",
                "rdfs:label": "href"
            },
            {
                "@id": "r:art4#39-attr-src",
                "rdf:value": "http://sflogo.sourceforge.net/sflogo.php?group_id=209563&type=1",
                "rdfs:label": "src"
            },
            {
                "@id": "r:art4#39-attr-style",
                "rdf:value": "border:0;",
                "rdfs:label": "style"
            },
            {
                "@id": "r:art4#39-attr-width",
                "rdf:value": "88",
                "rdfs:label": "width"
            },
            {
                "@id": "r:art4#3Bbottom",
                "@type": "b:Border",
                "b:borderColor": "#ffb200",
                "b:borderStyle": "SOLID",
                "b:borderWidth": {
                    "@type": "xsd:int",
                    "@value": "2"
                }
            },
            {
                "@id": "r:art4#3Bleft",
                "@type": "b:Border",
                "b:borderColor": "#ffb200",
                "b:borderStyle": "SOLID",
                "b:borderWidth": {
                    "@type": "xsd:int",
                    "@value": "2"
                }
            },
            {
                "@id": "r:art4#3Bright",
                "@type": "b:Border",
                "b:borderColor": "#ffb200",
                "b:borderStyle": "SOLID",
                "b:borderWidth": {
                    "@type": "xsd:int",
                    "@value": "2"
                }
            },
            {
                "@id": "r:art4#3Btop",
                "@type": "b:Border",
                "b:borderColor": "#ffb200",
                "b:borderStyle": "SOLID",
                "b:borderWidth": {
                    "@type": "xsd:int",
                    "@value": "2"
                }
            },
            {
                "@id": "r:art4#4",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#343434",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "4"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "24.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "1.0"
                },
                "b:hasAttribute": [
                    {
                        "@id": "r:art4#4-attr-class"
                    },
                    {
                        "@id": "r:art4#4-attr-href"
                    }
                ],
                "b:hasText": "CSS",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "37"
                },
                "b:isChildOf": {
                    "@id": "r:art4#3"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "17"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "25"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "37"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "65"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "17"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "25"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "65"
                }
            },
            {
                "@id": "r:art4#4-attr-class",
                "rdf:value": "s1",
                "rdfs:label": "class"
            },
            {
                "@id": "r:art4#4-attr-href",
                "rdf:value": "http://cssbox.sourceforge.net/",
                "rdfs:label": "href"
            },
            {
                "@id": "r:art4#40",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#000000",
                "b:containsImage": {
                    "@id": "urn:uuid:eb961b0a-7b4d-4020-9c3c-e3687b11e84a"
                },
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "40"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "10.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasAttribute": [
                    {
                        "@id": "r:art4#40-attr-alt"
                    },
                    {
                        "@id": "r:art4#40-attr-width"
                    },
                    {
                        "@id": "r:art4#40-attr-style"
                    },
                    {
                        "@id": "r:art4#40-attr-src"
                    },
                    {
                        "@id": "r:art4#40-attr-height"
                    }
                ],
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "1"
                },
                "b:htmlTagName": "img",
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "41"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "870"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "1"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "1"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "41"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "870"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "1"
                }
            },
            {
                "@id": "r:art4#40-attr-alt",
                "rdf:value": "TOPlist",
                "rdfs:label": "alt"
            },
            {
                "@id": "r:art4#40-attr-height",
                "rdf:value": "1",
                "rdfs:label": "height"
            },
            {
                "@id": "r:art4#40-attr-src",
                "rdf:value": "http://toplist.cz/dot.asp?id=624205",
                "rdfs:label": "src"
            },
            {
                "@id": "r:art4#40-attr-style",
                "rdf:value": "border:0;",
                "rdfs:label": "style"
            },
            {
                "@id": "r:art4#40-attr-width",
                "rdf:value": "1",
                "rdfs:label": "width"
            },
            {
                "@id": "r:art4#41",
                "@type": "b:Box",
                "b:backgroundColor": "#eeeeee",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#000000",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "41"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "10.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasAttribute": [
                    {
                        "@id": "r:art4#41-attr-class"
                    },
                    {
                        "@id": "r:art4#41-attr-id"
                    }
                ],
                "b:hasBottomBorder": {
                    "@id": "r:art4#41Bbottom"
                },
                "b:hasTopBorder": {
                    "@id": "r:art4#41Btop"
                },
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "249"
                },
                "b:htmlTagName": "div",
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "133"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "249"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "147"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "133"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "147"
                }
            },
            {
                "@id": "r:art4#41-attr-class",
                "rdf:value": "menu",
                "rdfs:label": "class"
            },
            {
                "@id": "r:art4#41-attr-id",
                "rdf:value": "mainmenu",
                "rdfs:label": "id"
            },
            {
                "@id": "r:art4#41Bbottom",
                "@type": "b:Border",
                "b:borderColor": "#dddddd",
                "b:borderStyle": "SOLID",
                "b:borderWidth": {
                    "@type": "xsd:int",
                    "@value": "4"
                }
            },
            {
                "@id": "r:art4#41Btop",
                "@type": "b:Border",
                "b:borderColor": "#dddddd",
                "b:borderStyle": "SOLID",
                "b:borderWidth": {
                    "@type": "xsd:int",
                    "@value": "4"
                }
            },
            {
                "@id": "r:art4#42",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#000000",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "42"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "10.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasTopBorder": {
                    "@id": "r:art4#42Btop"
                },
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "1"
                },
                "b:htmlTagName": "hr",
                "b:isChildOf": {
                    "@id": "r:art4#41"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "27"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "317"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "1"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "120"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "27"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "317"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "120"
                }
            },
            {
                "@id": "r:art4#42Btop",
                "@type": "b:Border",
                "b:borderColor": "#999999",
                "b:borderStyle": "SOLID",
                "b:borderWidth": {
                    "@type": "xsd:int",
                    "@value": "1"
                }
            },
            {
                "@id": "r:art4#43",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#232323",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "43"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "10.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "1.0"
                },
                "b:hasAttribute": {
                    "@id": "r:art4#43-attr-href"
                },
                "b:hasBottomBorder": {
                    "@id": "r:art4#43Bbottom"
                },
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "17"
                },
                "b:htmlTagName": "a",
                "b:isChildOf": {
                    "@id": "r:art4#41"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "27"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "163"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "17"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "45"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "27"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "163"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "45"
                }
            },
            {
                "@id": "r:art4#43-attr-href",
                "rdf:value": "index.php",
                "rdfs:label": "href"
            },
            {
                "@id": "r:art4#43Bbottom",
                "@type": "b:Border",
                "b:borderColor": "#ffb200",
                "b:borderStyle": "SOLID",
                "b:borderWidth": {
                    "@type": "xsd:int",
                    "@value": "1"
                }
            },
            {
                "@id": "r:art4#44",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#232323",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "44"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "10.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "1.0"
                },
                "b:hasAttribute": {
                    "@id": "r:art4#44-attr-href"
                },
                "b:hasText": "About",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:isChildOf": {
                    "@id": "r:art4#43"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "31"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "163"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "37"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "31"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "163"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "37"
                }
            },
            {
                "@id": "r:art4#44-attr-href",
                "rdf:value": "index.php",
                "rdfs:label": "href"
            },
            {
                "@id": "r:art4#45",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#232323",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "45"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "10.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "1.0"
                },
                "b:hasAttribute": {
                    "@id": "r:art4#45-attr-href"
                },
                "b:hasText": "Documentation",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:isChildOf": {
                    "@id": "r:art4#41"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "31"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "203"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "96"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "31"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "203"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "96"
                }
            },
            {
                "@id": "r:art4#45-attr-href",
                "rdf:value": "documentation.php",
                "rdfs:label": "href"
            },
            {
                "@id": "r:art4#46",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#232323",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "46"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "10.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "1.0"
                },
                "b:hasAttribute": {
                    "@id": "r:art4#46-attr-href"
                },
                "b:hasText": "Download",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:isChildOf": {
                    "@id": "r:art4#41"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "31"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "243"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "64"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "31"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "243"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "64"
                }
            },
            {
                "@id": "r:art4#46-attr-href",
                "rdf:value": "download.php",
                "rdfs:label": "href"
            },
            {
                "@id": "r:art4#47",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#232323",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "47"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "10.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "1.0"
                },
                "b:hasAttribute": {
                    "@id": "r:art4#47-attr-href"
                },
                "b:hasText": "Credits",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:isChildOf": {
                    "@id": "r:art4#41"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "31"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "283"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "44"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "31"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "283"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "44"
                }
            },
            {
                "@id": "r:art4#47-attr-href",
                "rdf:value": "credits.php",
                "rdfs:label": "href"
            },
            {
                "@id": "r:art4#48",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#232323",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "48"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "10.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "1.0"
                },
                "b:hasAttribute": {
                    "@id": "r:art4#48-attr-href"
                },
                "b:hasText": "Project Page",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:isChildOf": {
                    "@id": "r:art4#41"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "31"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "337"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "82"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "31"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "337"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "82"
                }
            },
            {
                "@id": "r:art4#48-attr-href",
                "rdf:value": "http://sourceforge.net/projects/cssbox/",
                "rdfs:label": "href"
            },
            {
                "@id": "r:art4#49",
                "@type": "b:Box",
                "b:backgroundColor": "#eeeeee",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#000000",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "49"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "10.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasAttribute": [
                    {
                        "@id": "r:art4#49-attr-class"
                    },
                    {
                        "@id": "r:art4#49-attr-id"
                    }
                ],
                "b:hasBottomBorder": {
                    "@id": "r:art4#49Bbottom"
                },
                "b:hasTopBorder": {
                    "@id": "r:art4#49Btop"
                },
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "280"
                },
                "b:htmlTagName": "div",
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "373"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "280"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "147"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "373"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "147"
                }
            },
            {
                "@id": "r:art4#49-attr-class",
                "rdf:value": "menu",
                "rdfs:label": "class"
            },
            {
                "@id": "r:art4#49-attr-id",
                "rdf:value": "subproj",
                "rdfs:label": "id"
            },
            {
                "@id": "r:art4#49Bbottom",
                "@type": "b:Border",
                "b:borderColor": "#dddddd",
                "b:borderStyle": "SOLID",
                "b:borderWidth": {
                    "@type": "xsd:int",
                    "@value": "4"
                }
            },
            {
                "@id": "r:art4#49Btop",
                "@type": "b:Border",
                "b:borderColor": "#dddddd",
                "b:borderStyle": "SOLID",
                "b:borderWidth": {
                    "@type": "xsd:int",
                    "@value": "4"
                }
            },
            {
                "@id": "r:art4#5",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#343434",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "5"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "24.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "1.0"
                },
                "b:hasAttribute": [
                    {
                        "@id": "r:art4#5-attr-class"
                    },
                    {
                        "@id": "r:art4#5-attr-href"
                    }
                ],
                "b:hasBottomBorder": {
                    "@id": "r:art4#5Bbottom"
                },
                "b:hasLeftBorder": {
                    "@id": "r:art4#5Bleft"
                },
                "b:hasRightBorder": {
                    "@id": "r:art4#5Bright"
                },
                "b:hasTopBorder": {
                    "@id": "r:art4#5Btop"
                },
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "41"
                },
                "b:htmlTagName": "span",
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "84"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "23"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "41"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "63"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "84"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "23"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "63"
                }
            },
            {
                "@id": "r:art4#5-attr-class",
                "rdf:value": "s2",
                "rdfs:label": "class"
            },
            {
                "@id": "r:art4#5-attr-href",
                "rdf:value": "http://cssbox.sourceforge.net/",
                "rdfs:label": "href"
            },
            {
                "@id": "r:art4#50",
                "@type": "b:Box",
                "b:backgroundColor": "#dddddd",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#000000",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "50"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "8.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "1.0"
                },
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "26"
                },
                "b:htmlTagName": "h2",
                "b:isChildOf": {
                    "@id": "r:art4#49"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "377"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "26"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "147"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "377"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "147"
                }
            },
            {
                "@id": "r:art4#51",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#000000",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "51"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "8.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "1.0"
                },
                "b:hasText": "Subprojects",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:isChildOf": {
                    "@id": "r:art4#50"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "24"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "383"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "67"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "24"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "383"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "67"
                }
            },
            {
                "@id": "r:art4#52",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#232323",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "52"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "10.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "1.0"
                },
                "b:hasAttribute": {
                    "@id": "r:art4#52-attr-href"
                },
                "b:hasText": "jStyleParser",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:isChildOf": {
                    "@id": "r:art4#49"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "31"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "416"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "77"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "31"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "416"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "77"
                }
            },
            {
                "@id": "r:art4#52-attr-href",
                "rdf:value": "jstyleparser",
                "rdfs:label": "href"
            },
            {
                "@id": "r:art4#53",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#232323",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "53"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "8.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasAttribute": {
                    "@id": "r:art4#53-attr-href"
                },
                "b:hasText": "Java CSS parser",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:isChildOf": {
                    "@id": "r:art4#49"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "30"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "435"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "82"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "30"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "435"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "82"
                }
            },
            {
                "@id": "r:art4#53-attr-href",
                "rdf:value": "jstyleparser",
                "rdfs:label": "href"
            },
            {
                "@id": "r:art4#54",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#232323",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "54"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "8.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasAttribute": {
                    "@id": "r:art4#54-attr-href"
                },
                "b:hasText": "project",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:isChildOf": {
                    "@id": "r:art4#49"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "30"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "451"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "33"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "30"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "451"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "33"
                }
            },
            {
                "@id": "r:art4#54-attr-href",
                "rdf:value": "jstyleparser",
                "rdfs:label": "href"
            },
            {
                "@id": "r:art4#55",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#232323",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "55"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "10.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "1.0"
                },
                "b:hasAttribute": {
                    "@id": "r:art4#55-attr-href"
                },
                "b:hasText": "SwingBox",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:isChildOf": {
                    "@id": "r:art4#49"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "31"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "473"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "65"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "31"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "473"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "65"
                }
            },
            {
                "@id": "r:art4#55-attr-href",
                "rdf:value": "swingbox",
                "rdfs:label": "href"
            },
            {
                "@id": "r:art4#56",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#232323",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "56"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "8.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasAttribute": {
                    "@id": "r:art4#56-attr-href"
                },
                "b:hasText": "Swing HTML rendering",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:isChildOf": {
                    "@id": "r:art4#49"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "30"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "492"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "109"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "30"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "492"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "109"
                }
            },
            {
                "@id": "r:art4#56-attr-href",
                "rdf:value": "swingbox",
                "rdfs:label": "href"
            },
            {
                "@id": "r:art4#57",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#232323",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "57"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "8.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasAttribute": {
                    "@id": "r:art4#57-attr-href"
                },
                "b:hasText": "component.",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:isChildOf": {
                    "@id": "r:art4#49"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "30"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "508"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "56"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "30"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "508"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "56"
                }
            },
            {
                "@id": "r:art4#57-attr-href",
                "rdf:value": "swingbox",
                "rdfs:label": "href"
            },
            {
                "@id": "r:art4#58",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#232323",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "58"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "10.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "1.0"
                },
                "b:hasAttribute": {
                    "@id": "r:art4#58-attr-href"
                },
                "b:hasText": "Pdf2Dom",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:isChildOf": {
                    "@id": "r:art4#49"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "31"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "530"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "57"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "31"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "530"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "57"
                }
            },
            {
                "@id": "r:art4#58-attr-href",
                "rdf:value": "pdf2dom",
                "rdfs:label": "href"
            },
            {
                "@id": "r:art4#59",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#232323",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "59"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "8.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasAttribute": {
                    "@id": "r:art4#59-attr-href"
                },
                "b:hasText": "PDF parser with a DOM",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:isChildOf": {
                    "@id": "r:art4#49"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "30"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "549"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "113"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "30"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "549"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "113"
                }
            },
            {
                "@id": "r:art4#59-attr-href",
                "rdf:value": "pdf2dom",
                "rdfs:label": "href"
            },
            {
                "@id": "r:art4#5Bbottom",
                "@type": "b:Border",
                "b:borderColor": "#aaaaaa",
                "b:borderStyle": "SOLID",
                "b:borderWidth": {
                    "@type": "xsd:int",
                    "@value": "2"
                }
            },
            {
                "@id": "r:art4#5Bleft",
                "@type": "b:Border",
                "b:borderColor": "#aaaaaa",
                "b:borderStyle": "SOLID",
                "b:borderWidth": {
                    "@type": "xsd:int",
                    "@value": "2"
                }
            },
            {
                "@id": "r:art4#5Bright",
                "@type": "b:Border",
                "b:borderColor": "#aaaaaa",
                "b:borderStyle": "SOLID",
                "b:borderWidth": {
                    "@type": "xsd:int",
                    "@value": "2"
                }
            },
            {
                "@id": "r:art4#5Btop",
                "@type": "b:Border",
                "b:borderColor": "#aaaaaa",
                "b:borderStyle": "SOLID",
                "b:borderWidth": {
                    "@type": "xsd:int",
                    "@value": "2"
                }
            },
            {
                "@id": "r:art4#6",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#343434",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "6"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "24.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "1.0"
                },
                "b:hasAttribute": [
                    {
                        "@id": "r:art4#6-attr-class"
                    },
                    {
                        "@id": "r:art4#6-attr-href"
                    }
                ],
                "b:hasText": "Box",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "37"
                },
                "b:isChildOf": {
                    "@id": "r:art4#5"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "86"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "25"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "37"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "59"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "86"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "25"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "59"
                }
            },
            {
                "@id": "r:art4#6-attr-class",
                "rdf:value": "s2",
                "rdfs:label": "class"
            },
            {
                "@id": "r:art4#6-attr-href",
                "rdf:value": "http://cssbox.sourceforge.net/",
                "rdfs:label": "href"
            },
            {
                "@id": "r:art4#60",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#232323",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "60"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "8.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasAttribute": {
                    "@id": "r:art4#60-attr-href"
                },
                "b:hasText": "interface",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:isChildOf": {
                    "@id": "r:art4#49"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "30"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "565"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "43"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "30"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "565"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "43"
                }
            },
            {
                "@id": "r:art4#60-attr-href",
                "rdf:value": "pdf2dom",
                "rdfs:label": "href"
            },
            {
                "@id": "r:art4#61",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#232323",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "61"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "10.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "1.0"
                },
                "b:hasAttribute": {
                    "@id": "r:art4#61-attr-href"
                },
                "b:hasText": "WebVector",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:isChildOf": {
                    "@id": "r:art4#49"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "31"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "587"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "69"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "31"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "587"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "69"
                }
            },
            {
                "@id": "r:art4#61-attr-href",
                "rdf:value": "webvector",
                "rdfs:label": "href"
            },
            {
                "@id": "r:art4#62",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#232323",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "62"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "8.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasAttribute": {
                    "@id": "r:art4#62-attr-href"
                },
                "b:hasText": "HTML to SVG",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:isChildOf": {
                    "@id": "r:art4#49"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "30"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "606"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "64"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "30"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "606"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "64"
                }
            },
            {
                "@id": "r:art4#62-attr-href",
                "rdf:value": "webvector",
                "rdfs:label": "href"
            },
            {
                "@id": "r:art4#63",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#232323",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "63"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "8.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasAttribute": {
                    "@id": "r:art4#63-attr-href"
                },
                "b:hasText": "convertor and renderer",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:isChildOf": {
                    "@id": "r:art4#49"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "30"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "622"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "13"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "113"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "30"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "622"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "113"
                }
            },
            {
                "@id": "r:art4#63-attr-href",
                "rdf:value": "webvector",
                "rdfs:label": "href"
            },
            {
                "@id": "r:art4#7",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#000000",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "7"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "10.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "1.0"
                },
                "b:hasText": "CSSBox",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "228"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "152"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "52"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "228"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "152"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "52"
                }
            },
            {
                "@id": "r:art4#8",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#000000",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "8"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "10.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasText": " is an (X)HTML/CSS rendering engine written in pure Java. Its primary purpose is to provide a complete and further processable information about",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "280"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "152"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "831"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "280"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "152"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "831"
                }
            },
            {
                "@id": "r:art4#9",
                "@type": "b:Box",
                "b:belongsTo": {
                    "@id": "r:art4"
                },
                "b:color": "#000000",
                "b:documentOrder": {
                    "@type": "xsd:int",
                    "@value": "9"
                },
                "b:fontFamily": "Arial",
                "b:fontSize": {
                    "@type": "xsd:float",
                    "@value": "10.0"
                },
                "b:fontStyle": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:fontWeight": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:hasText": "the rendered page contents and layout. However, it may be also used for browsing the rendered documents in Java Swing applications. ",
                "b:height": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:isChildOf": {
                    "@id": "r:art4#0"
                },
                "b:lineThrough": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:positionX": {
                    "@type": "xsd:int",
                    "@value": "201"
                },
                "b:positionY": {
                    "@type": "xsd:int",
                    "@value": "176"
                },
                "b:underline": {
                    "@type": "xsd:float",
                    "@value": "0.0"
                },
                "b:visualHeight": {
                    "@type": "xsd:int",
                    "@value": "16"
                },
                "b:visualWidth": {
                    "@type": "xsd:int",
                    "@value": "780"
                },
                "b:visualX": {
                    "@type": "xsd:int",
                    "@value": "201"
                },
                "b:visualY": {
                    "@type": "xsd:int",
                    "@value": "176"
                },
                "b:width": {
                    "@type": "xsd:int",
                    "@value": "780"
                }
            },
            {
                "@id": "urn:uuid:3f0ff03f-38e0-42df-9500-7064fceea9ac",
                "@type": "b:Image",
                "b:imageUrl": "http://a.fsdn.com/con/app/proj/cssbox/screenshots/318271.jpg/182/137"
            },
            {
                "@id": "urn:uuid:6e06f820-247f-4419-8691-d0b5858de546",
                "@type": "b:Image",
                "b:imageUrl": "http://sflogo.sourceforge.net/sflogo.php?group_id=209563&type=1"
            },
            {
                "@id": "urn:uuid:c36f2a79-f01d-43bd-8d90-bb55a2d89409",
                "@type": "b:Image",
                "b:imageUrl": "http://a.fsdn.com/con/app/proj/cssbox/screenshots/browser1.jpeg/182/137"
            },
            {
                "@id": "urn:uuid:eac14358-2f44-4e85-9c18-3ca7eddc9cb8",
                "@type": "b:Image",
                "b:imageUrl": "http://a.fsdn.com/con/app/proj/cssbox/screenshots/318269.jpg/182/137"
            },
            {
                "@id": "urn:uuid:eb961b0a-7b4d-4020-9c3c-e3687b11e84a",
                "@type": "b:Image",
                "b:imageUrl": "http://toplist.cz/dot.asp?id=624205"
            }
        ],
        "@id": "r:art4",
        "@context": {
            "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
            "xsd": "http://www.w3.org/2001/XMLSchema#",
            "b": "http://fitlayout.github.io/ontology/render.owl#",
            "a": "http://fitlayout.github.io/ontology/segmentation.owl#",
            "fl": "http://fitlayout.github.io/ontology/fitlayout.owl#",
            "r": "http://fitlayout.github.io/resource/"
        }
    }
    
`);
myParser.end();
module.exports = [boxes];
