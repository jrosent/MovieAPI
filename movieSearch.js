const apiKey = 'e2f4f3b5&';

//Main search function to call on search button click
async function searchMovies(searchType){

    //Create a URL object for searching the API
    const endpoint = new URL('http://www.omdbapi.com/?apikey=' + apiKey);

    //Get data from previous search 
    var link = document.getElementById(searchType + '_link');
    var payload = document.getElementById(searchType + '_payload');

    //Read information from user input
    setURL(endpoint,searchType);
    writeHistory(endpoint,searchType);

    //Fetch data from the omdb API
    var responseData = await fetch(endpoint.toString());
    var fieldset = getFieldset(endpoint,searchType);

    //Parse data and add it to the search page
    if(endpoint.searchParams.get('r') === 'json'){
        var data = await responseData.json();
        var table = createResponse(data,'json','sbt');
    }else{
        let txt = await responseData.text();
        const parser = new DOMParser();
        let xml = parser.parseFromString(txt,'application/xml');
        var table = createResponse(xml, 'xml', 'sbid');
    }

    //Create a document element that shows/creates a link to the api without the key
    var a = document.createElement('a');
    a.href = endpoint.toString();
    endpoint.searchParams.delete('apikey');
    a.innerHTML = endpoint.toString();

    //Create.update elements for adding movie search data
    if(link !== null){
        link.innerHTML = '';
        link.appendChild(a);
        payload.innerHTML = '';
        payload.appendChild(table);
    } else{
        requestTitle = document.createElement('h3');
        requestTitle.setAttribute('id',searchType + '_requestTitle');
        requestTitle.innerHTML = 'Request:';

        link = document.createElement('p');
        link.setAttribute('id', searchType + '_link');
        link.appendChild(a);

        responseTitle = document.createElement('h3');
        responseTitle.setAttribute('id',searchType + '_responseTitle');
        responseTitle.innerHTML = 'Response:';

        payload = document.createElement('p');
        payload.setAttribute('id',searchType + '_payload');
        payload.appendChild(table);
    }
    
    fieldset.appendChild(requestTitle);
    fieldset.appendChild(link);
    fieldset.appendChild(responseTitle);
    fieldset.appendChild(payload);
    
}

//Sets the URL for fetching movie data base on search type and user input and saves information to
//session storage
function setURL(address,searchType){
    if(searchType === "sbt"){
        //Read input from user form    
        var title = document.getElementById('t').value;
        var year = document.getElementById('y').value;
        var plot = document.getElementById('sbt_plot').value;
        var rsp = document.getElementById('sbt_response').value;

        //Set URL object with input
        if(title !== ''){
            address.searchParams.set('t', title);
        }
        if(year !== ''){
            address.searchParams.set('y', year);
        }
    }
    else{
        var id = document.getElementById('i').value;
        var plot = document.getElementById('sbid_plot').value;
        var rsp = document.getElementById('sbid_response').value;

        //Set URL object with input
        if(id !== ''){
            address.searchParams.set('i', id);
        }
        
    }

    address.searchParams.set('plot', plot);
    address.searchParams.set('r', rsp);

}

//Returns the fieldset from which the search took place
function getFieldset(address,searchType){
   if(searchType === 'sbt'){
       return document.getElementById('sbt_fieldset');
   }

   return document.getElementById('sbid_fieldset');
}

//Create the table with response data from obdm API search
function createResponse(data, type, form){
    var table = document.createElement('table');
    table.setAttribute('id',form + "_table");

     if(type === 'json') {
        for (key in data) {
            let tr = document.createElement('tr');

            let label = document.createElement('td');
            label.innerHTML = key;

            let mvd = document.createElement('td');


            if (key === 'Ratings') {
                let rtable = document.createElement('table');

                for (rObj in data[key]) {
                    let th = document.createElement('thead');
                    th.innerHTML = rObj;
                    rtable.appendChild(th);

                    for (rkey in data[key][rObj]) {
                        let tr = document.createElement('tr');
                        let rlabel = document.createElement('td');
                        rlabel.innerHTML = rkey;
                        let rmvd = document.createElement('td');
                        rmvd.innerHTML = data[key][rObj][rkey];

                        tr.appendChild(rlabel);
                        tr.appendChild(rmvd);
                        rtable.appendChild(tr);
                    }
                }

                mvd.appendChild(rtable);
            } else if (data[key].includes('http')) {
                let anc = document.createElement('a');
                anc.href = data[key];
                anc.innerHTML = data[key];
                mvd.appendChild(anc);
            } else if(key === 'Plot'){
                mvd.setAttribute('id','plot');
                mvd.innerHTML = data[key];
            }
            else{
                mvd.innerHTML = data[key];
            }


            tr.appendChild(label);
            tr.appendChild(mvd);
            table.appendChild(tr);
        }
    }else if(type === 'xml'){
        const movie = data.getElementsByTagName('movie')[0].attributes;
        for(var i = 0; i < movie.length; i++){

            let tr = document.createElement('tr');

            let label = document.createElement('td');
            label.innerHTML = movie[i].name;

            let mvd = document.createElement('td');
            if(movie[i].value.includes('http')){
                let anc = document.createElement('a');
                anc.href = movie[i].value;
                anc.innerHTML = movie[i].value;
                mvd.appendChild(anc);
            }else if(movie[i].name === 'plot'){
                mvd.setAttribute('id', 'plot');
                mvd.innerHTML = movie[i].value;
            }
            else{
                mvd.innerHTML = movie[i].value;
            }

            tr.appendChild(label);
            tr.appendChild(mvd);
            table.appendChild(tr);
        }
    }
    return table;
}

//Writes history to the session storage to reference for history elements
function writeHistory(address,searchType){

    //Create the json object from url object
    let jsonObj = {};
    if(searchType === "sbt"){
        jsonObj.Title = address.searchParams.get('t');
        jsonObj.Year = address.searchParams.get('y');
    }
    else{
        jsonObj.ID = address.searchParams.get('i');
    }

    jsonObj.Plot = address.searchParams.get('plot');
    jsonObj.Response = address.searchParams.get('r');

    //Write searches array to session storage
    if(sessionStorage.getItem('Searches') === null){
        jsonObj.Index = 0;
        let jsonArr = [jsonObj]
        sessionStorage.setItem('Searches', JSON.stringify(jsonArr));
    }
    else{
        let searches = JSON.parse(sessionStorage.getItem('Searches'));
        let index = searches.length;
        jsonObj.Index = index;
        searches.push(jsonObj);
        sessionStorage.setItem('Searches', JSON.stringify(searches));
    }

    addHistoryElement(searchType, jsonObj);

    
}

//Adds a search history item to the list at the top of the page
function addHistoryElement(searchType, jsonObj){
    var history = document.getElementById('history');

    let searches = JSON.parse(sessionStorage.getItem('Searches'));

    //Check if an arrow should be added to the history list
    if(history.childNodes.length != 0){
        var arrow = document.createElement('span');
        arrow.innerHTML = " > ";
        history.appendChild(arrow);
    }
    
    //Begin a new line for the history
    if(history.childNodes.length % 29 === 0){
        history.appendChild(document.createElement('br'));
        }

    //Create new search history element and add it to the history element    
    var crumb = document.createElement('a');
    if(searchType === 'sbt'){
        if(jsonObj.Title !== null){
            crumb.innerHTML = jsonObj.Title;
        }
        else{
            crumb.innerHTML = jsonObj.Year;
        }
        crumb.setAttribute('href',"javascript:research(" + jsonObj.Index + ")");
    }
    else{
        crumb.innerHTML = jsonObj.ID;
        crumb.setAttribute('href','javascript:research(' + jsonObj.ID + "," + jsonObj.Plot + ","
        + jsonObj.Response + "," + jsonObj.Index + ')');
    }

    history.appendChild(crumb);
   
}

//Searches history item clicked and removes all items after
function research(index){
    let searches = JSON.parse(sessionStorage.getItem('Searches'));
    let type = 'none';

    if(searches[index].hasOwnProperty('Title')){
        document.getElementById('t').value = searches[index].Title;
        document.getElementById('y').value = searches[index].Year;
        type = 'sbt';
    }
    else{
        document.getElementById('i').value = searches[index].ID;
        type = 'sbid';
    }
    document.getElementById('sbt_plot').value = searches[index].Plot;
    document.getElementById('sbt_response').value = searches[index].Response

    let history = document.getElementById('history');
    console.log(history.childNodes.length);
    console.log(index);
    while(searches.length > index){
        history.removeChild(history.lastChild);
        history.removeChild(history.lastChild);
        searches.pop();
        console.log(history.childNodes.length);
    }

    sessionStorage.setItem('Searches', JSON.stringify(searches));

    searchMovies(type);

    
}


//Reset the search by title fieldset
function resetSBT(){

    //Check if movie data is present and clear
    if(document.getElementById('sbt_requestTitle') !== null){
        var f = document.getElementById('sbt_fieldset');
        f.removeChild(sbt_requestTitle);
        f.removeChild(sbt_link);
        f.removeChild(sbt_responseTitle);
        f.removeChild(sbt_payload);
    }
    //Set all search by title parameters to default
    document.getElementById('t').value = '';
    document.getElementById('y').value = '';
    document.getElementById('sbt_plot').value = 'short';
    document.getElementById('sbt_response').value = 'json'; 
}

//Reset the search by ID fieldset
function resetSBID(){
    
    //Check if movie data is present and clear
    if(document.getElementById('sbid_requestTitle') !== null){
        var f = document.getElementById('sbid_fieldset');
        f.removeChild(sbid_requestTitle);
        f.removeChild(sbid_link);
        f.removeChild(sbid_responseTitle);
        f.removeChild(sbid_payload);
    }

    //Set all search by ID parameters to default
    document.getElementById('i').value = '';
    document.getElementById('sbid_plot').value = 'short';
    document.getElementById('sbid_response').value = 'json'; 
}