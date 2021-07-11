
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.addEventListener('load', () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener('error', () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}

const http = customHttp();



const newsService = (function() {
  const apiKey = '854a73d1a7594cb6b3fa8697d443a8f8';
  const apiUrl = 'https://news-api-v2.herokuapp.com';

  return {

    topHeadlines(country = 'us',category = 'business', cb) {
      http.get(
        `${apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`,
        cb,
      );
    },

    everything(query, cb) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
    },
  };
})();


const form = document.forms['newsControls'];
const countrySelect = form.elements['country'];
const categorySelect = form.elements['category'];
const searchInput = form.elements['search'];
const newsContainer = document.querySelector('.news-container .row');

form.addEventListener('submit', e => {
  e.preventDefault();
  loadNews();
});

document.addEventListener('DOMContentLoaded', function() {
  M.AutoInit();
  loadNews();
});

function loadNews() {
  showLoader();

  const country = countrySelect.value;
  const searchText = searchInput.value;
  const category = categorySelect.value;

  if (!searchText) {
    newsService.topHeadlines(country, category, onGetResponse);
  } else {
    newsService.everything(searchText, onGetResponse);
  }
}


function onGetResponse(err, res) {
  removePreloader();

  if (err) {
    showAlert(err, 'error-msg');
    return;
  }

  if (!res.articles.length) {
    if (newsContainer.children.length) {
      clearContainer(newsContainer);
    }
    const emptyMsg = showEmptyMassage();
    newsContainer.insertAdjacentHTML('afterbegin', emptyMsg);
    return;
  }

  renderNews(res.articles);
}


function renderNews(news) {
  if (newsContainer.children.length) {
    clearContainer(newsContainer);
  }
  let fragment = '';

  news.forEach(newsItem => {
    const el = newsTemplate(newsItem);
    fragment += el;
  });

  newsContainer.insertAdjacentHTML('afterbegin', fragment);
}


function clearContainer(container) {
  let child = container.lastElementChild;
  while (child) {
    container.removeChild(child);
    child = container.lastElementChild;
  }
}


function newsTemplate({ urlToImage, title, url, description }) {
  return `
    <div class="col s12">
      <div class="card">
        <div class="card-image">
          <img src="${urlToImage || 'https://ulight.ru/uploads/images/items/covers/original/no.jpg'}">
          <span class="card-title">${title || ''}</span>
        </div>
        <div class="card-content">
          <p>${description || ''}</p>
        </div>
        <div class="card-action">
          <a href="${url}">Read more</a>
        </div>
      </div>
    </div>
  `;
}

function showEmptyMassage(){
  return `
    <div class="card blue-grey darken-1">
      <div class="card-content white-text">
        <span class="card-title">No articles</span>
        <p>Sorry, but we can't find articles for this data</p>
      </div>
    </div>
  `;
}

function showAlert(msg, type = 'success') {
  M.toast({ html: msg, classes: type });
}

function showLoader() {
  document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <div class="progress">
      <div class="indeterminate"></div>
    </div>
  `,
  );
}

function removePreloader() {
  const loader = document.querySelector('.progress');
  if (loader) {
    loader.remove();
  }
}
