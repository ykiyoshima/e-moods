import axios from "axios";
import noImage from "../img/no_image.png";

export const Setting = ({ title }) => {
  const artistIdsArray = [];
  const artistImagesArray = [];
  const artistNamesArray = [];
  const selectedArtistIdsArray = [];

  const token = async () => {
    const response = await axios.get('/token', { withCredentials: true });
    return {
      accessToken: response.data.accessToken,
      tokenGetTime: response.data.tokenGetTime
    }
  }

  const searchArtist = async () => {
    const accessToken = (await token()).accessToken;
    const tokenGetTime = (await token()).tokenGetTime;

    artistIdsArray.length = 0;
    artistImagesArray.length = 0;
    artistNamesArray.length = 0;
    const keyword = document.getElementById('keyword').value;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    };
    try {
      const response = await axios.get(`https://api.spotify.com/v1/search?q=artist:${keyword}&type=artist&include_external=audio&limit=6`, { headers: headers });
      response.data.artists.items.forEach(value => {
        artistIdsArray.push(value.id);
        if (value.images.length !== 0) {
          artistImagesArray.push(value.images[1].url);
        } else {
          artistImagesArray.push(noImage);
        }
        artistNamesArray.push(value.name);
      });
    } catch (error) {
      console.log(error);
    }
    let tags = '<span class="mr-6"></span>';
    for (let i = 0; i < artistIdsArray.length; i++) {
      tags += `<div data-id=${artistIdsArray[i]} class="artist flex-none overflow-scroll mr-6"><img src=${artistImagesArray[i]} class="w-48 h-48 object-cover pointer-events-none" data-id=${artistIdsArray[i]}><p class="pointer-events-none" data-id=${artistIdsArray[i]}>${artistNamesArray[i]}</p></div>`;
    }
    document.getElementById('result').innerHTML = tags;

    const artists = document.getElementById('result').getElementsByClassName('artist');
    for (let item of artists) {
      item.addEventListener('click', async (e) => {
        document.getElementById('result').innerHTML = null;
        selectedArtistIdsArray.push(e.target.dataset.id);
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        };
        const response = await axios.get(`https://api.spotify.com/v1/artists?ids=${selectedArtistIdsArray.join(',')}`, {headers: headers});
        let selectedArtistTags = '<span class="mr-6"></span>';
        for (let value of response.data.artists) {
          selectedArtistTags += `<div class="artist flex-none overflow-scroll mr-6"><img src=${value.images[1].url} class="w-48 h-48 object-cover pointer-events-none"><p class="pointer-events-none">${value.name}</p></div>`;
        }
        document.getElementById('selectedArtists').innerHTML = selectedArtistTags;

        const selectedArtists = document.getElementById('selectedArtists').getElementsByClassName('artist');
        for (let i = 0; i < selectedArtistIdsArray.length; i++) {
          selectedArtists[i].addEventListener('click', async () => {
            selectedArtistIdsArray.splice(i, 1);
            const headers = {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            };
            if (selectedArtistIdsArray.length > 0) {
              const response = await axios.get(`https://api.spotify.com/v1/artists?ids=${selectedArtistIdsArray.join(',')}`, {headers: headers});
              let selectedArtistTags = '<span class="mr-6"></span>';
              for (let value of response.data.artists) {
                selectedArtistTags += `<div class="artist flex-none overflow-scroll mr-6"><img src=${value.images[1].url} class="w-48 h-48 object-cover pointer-events-none"><p class="pointer-events-none">${value.name}</p></div>`;
              }
              document.getElementById('selectedArtists').innerHTML = selectedArtistTags;
            } else {
              document.getElementById('selectedArtists').innerHTML = null;
            }
          });
        }

        if (selectedArtistIdsArray.length === 5) {
          document.getElementById('next').innerHTML = '<button id="next_link" class="bg-green-500 rounded-lg w-48 py-2 px-4 mt-16">次へ進む</button>';
          document.getElementById('next_link').addEventListener('click', () => {
            localStorage.setItem('favorite', selectedArtistIdsArray);
            window.location.href = '/finish';
          });
        } else if (selectedArtistIdsArray.length !== 5) {
          document.getElementById('next').innerHTML = null;
        }
      });
    }
  }


  return (
    <div id="main" className="sm:w-full md:w-1/3 mx-auto">
      <h1 className="text-3xl font-bold pt-24 pb-16">{title}</h1>
      <p>好きなアーティストを5組選んでください</p>
      <p>※アルファベットで検索してください</p>
      <input className="text-gray-900 px-2 rounded-mb mt-8" type="text" id="keyword" /><br/>
      <button className="bg-green-500 rounded-lg w-48 py-2 px-4 mt-4 mb-8" type="submit" value="検索" onClick={() => searchArtist()}>検索</button>
      <div className="border-solid border-b-2 border-gray-100 w-2/3 h-62 mx-auto">
        <p>選んだアーティスト</p>
        <div id="selectedArtists" className="flex overflow-scroll mx-auto"></div>
      </div>
      <p>検索結果</p>
      <div id="result" className="flex overflow-scroll w-2/3 mx-auto"></div>
      <div id="next"></div>
    </div>
  )
};