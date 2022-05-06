var express = require('express');
var router = express.Router();

const NEWS_API_KEY = "8bd9eb5515424c39874d96e617f0d607" // change this
const RAPID_API_KEY = "2f77cb85f7msh0910f79193ddca5p19d61cjsn04e0d8e1d3f8" // change this
const NewsAPI = require('newsapi');

const axios = require("axios")

router.get('/headlines', async (req, res) => {
  const { headlines } = req.query;
  
  if (!headlines) {
    res.status(400).json({
      status: 400,
      message: "Missing headlines params"
    })
  }
  
  try {
    const newsapi = new NewsAPI(NEWS_API_KEY);
    const newsApiData = await newsapi.v2.everything({
      q: headlines,
    });

    const bingNewsOptions = {
      method: 'GET',
      url: 'https://bing-news-search1.p.rapidapi.com/news/search',
      params: {q: headlines},
      headers: {
        'X-BingApis-SDK': 'true',
        'X-RapidAPI-Host': 'bing-news-search1.p.rapidapi.com',
        'X-RapidAPI-Key': RAPID_API_KEY
      }
    };
    const bingNewsData = await axios.request(bingNewsOptions);

    
  
    const contextualWebSearchOptions = {
      method: 'GET',
      url: 'https://contextualwebsearch-websearch-v1.p.rapidapi.com/api/search/NewsSearchAPI',
      params: {
        q: headlines
      },
      headers: {
        'X-RapidAPI-Host': 'contextualwebsearch-websearch-v1.p.rapidapi.com',
        'X-RapidAPI-Key': RAPID_API_KEY,
      }
    };
    const contextualWebSearchData = await axios.request(contextualWebSearchOptions);
  
  
  
    const newsCatcherOptions = {
      method: 'GET',
      url: 'https://newscatcher.p.rapidapi.com/v1/search',
      params: {q: headlines },
      headers: {
        'X-RapidAPI-Host': 'newscatcher.p.rapidapi.com',
        'X-RapidAPI-Key': RAPID_API_KEY
      }
    };
    const newsCatcherData = await axios.request(newsCatcherOptions);
    
    const data = {
      newsApiData: newsApiData.totalResults || 0,
      bingNewsData: bingNewsData.data.totalEstimatedMatches || 0,
      contextualWebSearchData: contextualWebSearchData.data.totalCount || 0,
      newsCatcherData: newsCatcherData.data.total_hits || 0,
    }
    
    let validityPercentage = 0;
    Object.keys(data).map((key) => {
      if (data[key]) {
        validityPercentage = validityPercentage + 1;
      }
    });
  
    validityPercentage = (validityPercentage / 4) * 100;
    data.validityPercentage = validityPercentage;
    
    data.evaluation =
      validityPercentage <= 25 ? "fake news" :
        validityPercentage > 25 && validityPercentage <= 75 ? "somewhat valid news":
          "reliable news"
    
    data.sources = 4;
    res.status(200).send(data);
  } catch (e) {
    console.log('e', e);
    res.status(400).json({
      status: 400,
      message: e.message,
    })
  }
});

module.exports = router;
