/* 
App Config 
*/
const config = {
    loginApi: 'https://edocsapi.azurewebsites.net/Auth/api/Login',
    testLoginApi: 'https://edocsapi.azurewebsites.net/Auth/api/Test',
    portfolioApi: 'https://edocsapi.azurewebsites.net/Core6/api/Portfolio/ByUserId',
    username: 'testuser1@edocuments.co.uk',
    password: '20DemoPass20',
    appToken: 'xikxafatwae',
}

/* 
Auth Token
*/
let authToken = localStorage.getItem('authToken');

/* 
Login (Post) 
*/
async function login() {
    try {
        const response = await fetch(config.loginApi, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Digest username="' + config.appToken + '" realm="_root_" password=""',
            },
            body: JSON.stringify({
                'username': config.username,
                'password': config.password
            })
        });
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const json = await response.json()
        return json;
    }
    catch(error) {
        console.log(`Could not post to login: ${error}`)
    }
}

/* 
Test Login (Post) 
*/
async function test() {
    try {
        const response = await fetch(config.testLoginApi, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Authorization': 'Digest username="' + config.appToken + '" realm="_root_" password="' + authToken + '"',
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const json = await response.json()
        return json;
    }
    catch(error) {
        console.log(`Could not post to test: ${error}`)
    }
}

/* 
Portfolio (Get) 
*/
async function portfolio() {
    try {
        const response = await fetch(config.portfolioApi, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Authorization': 'Digest username="' + config.appToken + '" realm="_root_" password="' + authToken + '"',
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const json = await response.json()
        return json;
    }
    catch(error) {
        console.log(`Could not get portfolio: ${error}`)
    }
}

/* 
Build Portfolio Results UI
*/
function portfolioResultsUi(json) {
    const searchResults = document.querySelector('.search-results');

    json.Result.sites.forEach((item, index) => {

        const searchResult = document.createElement('div');
        searchResult.classList.add('search-result');
        const projects = document.createElement('ul');
        projects.classList.add('hide');

        let nameAddress = 
        `<div>
            <p class="search-result-title">${item.name}</p>
            <p>${item.address}</p>
            <button type="button" class="toggle-projects-${index}">View projects</button>
        </div>`;

        searchResult.innerHTML += nameAddress;

        item.projects.forEach((item) => {
            let project = `<li>${item.name}</li>`;

            projects.innerHTML += project;
        });

        searchResult.append(projects);
        searchResults.append(searchResult);

        const toggleProjects = document.querySelector(`.toggle-projects-${index}`);
        toggleProjects.addEventListener('click', function (event) {
            event.preventDefault();
            projects.classList.toggle('hide');
        })

    }); 
}

/* 
Run App
*/
if(authToken !== null) {
    test()
        .then(json => {
            const valid = json.Result.auth.valid;
            if(valid) {
                portfolio().then(json => portfolioResultsUi(json))
            } else {
                login()
                    .then(json => {
                        localStorage.setItem('authToken', json.Result.auth.token);
                        authToken = localStorage.getItem('authToken');
                    })
                    .then(() => {
                        portfolio().then(json => portfolioResultsUi(json))
                    })
            }
        });
} else {
    login()
        .then(json => {
            localStorage.setItem('authToken', json.Result.auth.token);
            authToken = localStorage.getItem('authToken');
        })
        .then(() => {
            portfolio().then(json => portfolioResultsUi(json))
        })
}