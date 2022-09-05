function getIdForWFTabFromElement(elt) {
      var parent = elt.parentElement;
      while (parent != null && parent.tagName.toLowerCase() != "mat-tab-body") {
          parent = parent.parentElement;
      }
      var wf_tab_id = "";
      if (parent != null) {
         wf_tab_id = parent.getAttribute("id");
         var wfNames = parent.getElementsByTagName("type-label-area");
         if (wfNames != null && wfNames.length > 0) {
             wf_tab_id = wf_tab_id + "_" + wfNames[0].innerText.replaceAll(/[^-_0-9a-zA-Z]+/g,"#");
         }
      }
    return wf_tab_id;
}

function getIdForMapping(formula_area) {
  if (formula_area.parentElement.tagName.toLowerCase() == "mapping") {
     var wf_tab_id = getIdForWFTabFromElement(formula_area);
  try {
     return wf_tab_id + "_" + formula_area.nextElementSibling.firstElementChild.getAttribute("id")
   } catch (e) {
    return "";
   }
  }
  
  return "";
}

function adaptVisibilityOfElement(elt, eltId) {
    let key = eltId + ".hidden";
    let eltHidden = window.sessionStorage.getItem(key);;
    if (eltHidden == null || eltHidden == "false") {
        eltHidden = "true";
    } else {
        eltHidden = "false";
    }
    window.sessionStorage.setItem(key, eltHidden);
    hideOrShowElement(elt, eltHidden);
}

function setVisibilityOfElement(elt, eltId) {
    let key = eltId + ".hidden";
    let eltHidden = window.sessionStorage.getItem(key);;
    if (eltHidden == null) {
        eltHidden = "true";
        window.sessionStorage.setItem(key, eltHidden);
    }
    hideOrShowElement(elt, eltHidden);
}

function hideOrShowElement(elt, eltHidden) {
    if (eltHidden == "true") {
        elt.style.display = "none";
    } else {
        elt.style.display = "flex";
    }    
}


function handleDocumentationArea(newNode) {
            for (let docu of newNode.children) {
                if (docu.nodeName.toLowerCase() != "documentation-area") continue;
                //console.log(mutationRecord);
                if (docu.children != null && docu.children[0].childNodes.length > 0) {
                    let info = document.createElement("span");
                    info.setAttribute("class", "icon-xds-info");
                    info.onclick = () => {
                                let attr = docu.getAttribute("class");
                                if (attr.match("collapsed") != null) {
                                    docu.setAttribute("class", attr.replace(new RegExp(/\s*collapsed\s*/), ""));
                                } else {
                                    docu.setAttribute("class", attr + " collapsed");                                    
                                };
                    };
                    let label = newNode.parentElement.getElementsByTagName("label-area")[0];
                    if (label.getElementsByClassName("icon-xds-info").length <= 0) label.appendChild(info);
                }
            }
}

var callback = function handleChangedNode(mutationRecords, observer) {
    for (mutationRecord of mutationRecords) {
       //if (mutationRecord.removedNodes != null && mutationRecord.removedNodes.length > 0) console.log(mutationRecord);
       /* console.log(mutationRecord.target.nodeName);
       for (let newNode of mutationRecord.addedNodes) {
           console.log(mutationRecord.target.nodeName+ " => " + newNode.nodeName);
       } */
       
       if (mutationRecord.type != "childList") continue;
       
       if (mutationRecord.target.nodeName.toLowerCase() == "div") {
        for (let newNode of mutationRecord.addedNodes) {
            //console.log(mutationRecord.target.nodeName+ " => " + newNode.nodeName);
           let nodeName = newNode.nodeName.toLowerCase();
           if (nodeName == "dataflow") {
               handleDocumentationArea(newNode.parentNode);
           };
           break;
        }
       };
       
       if (mutationRecord.target.nodeName.toLowerCase() != "service-step") continue;
       
       for (let newNode of mutationRecord.addedNodes) {
           let nodeName = newNode.nodeName.toLowerCase();
           if (nodeName == "mapping") {
              //console.log(mutationRecord);
              let formulaArea = newNode.getElementsByTagName("formula-area")[0];
              let id = getIdForMapping(formulaArea);
              //console.log("added: " + id);
              setVisibilityOfElement(formulaArea, id);
              mutationRecord.target.getElementsByTagName("label-area")[0].getElementsByTagName("xc-icon")[1].ondblclick = () => {
                adaptVisibilityOfElement(formulaArea, id);
                return
              };
              //break
           }
           if (nodeName == "query") {
                //console.log(mutationRecord);
                mutationRecord.target.getElementsByTagName("label-area")[0].getElementsByTagName("xc-icon")[1].ondblclick = () => {
                    let tags = Array.from(["filter-criterion-area", "selection-mask-criterion-area", "sorting-criterion-area"]);
                    tags.forEach((tag) => {
                        var elts = newNode.getElementsByTagName(tag);
                        for (i=0; i<elts.length; i++) {
                            let disp = elts.item(i).style.display;
                            elts.item(i).style.display = (disp == "none") ? "flex" : "none";
                        }
                    });
                    Array.from(newNode.getElementsByClassName("config-area")).forEach((elt) => {elt.style.display = (elt.style.display == "none") ? "flex" : "none";});
                    return
                };
                //break
           }
           if (nodeName == "query" || nodeName == "mapping" || nodeName == "invocation") {
                handleDocumentationArea(newNode);
           }
        }
    }
}

const targetNode = document.getElementsByTagName('app-root')[0];
if (targetNode != null) {
    var myObserver = new MutationObserver(callback);
    myObserver.observe(targetNode, { attributes: false, childList: true, subtree: true });
}