import React, {useState} from 'react';
import axios, { AxiosResponse, AxiosError } from 'axios'
import {Result, ApiResponse} from './types'
import { debounce } from 'lodash';

function App() {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('');
  const [stars, setStars] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  }

  const handleLanguageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLanguage(event.target.value);
  }

  const handleStarsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStars(Number(event.target.value));
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setCurrentPage(1);
    handleSearch();
  }

  const handleSearch = () => {
    axios
      .get('https://api.github.com/search/repositories', {
        params: {
          q: query,
          language,
          stars: `>${stars}`,
          per_page: 10
        }
      })
      .then((response: AxiosResponse<any>) => {
        setResults(response.data.items);
        setTotalCount(response.data.total_count);
        setHasNextPage(response.data.items.length > 0);
        setIsLoading(false);
      })
      .catch((error: AxiosError<any>) => {
        console.log(error);
      });
  };

  const handleLoadMore = () => {
    setIsLoading(true);
    axios
      .get<ApiResponse>("https://api.github.com/search/repositories", {
        params: {
          q: query,
          language,
          stars: `>${stars}`,
          per_page: 10,
          page: currentPage + 1,
        },
      })
      .then((response) => {
        setResults((prevResults) => [...prevResults, ...response.data.items]);
        setCurrentPage((prevPage) => prevPage + 1);
        setHasNextPage(response.data.items.length > 0);
        setIsLoading(false);
      });
  }

  const debounceLoadMore = debounce(handleLoadMore, 500);

  return(
    <div>
      <form onSubmit={handleSubmit}>
        <input type='text' value={query} onChange={(e) => handleQueryChange} placeholder="Enter a search query" />
        <input type='text' value={language} onChange={(e) => handleLanguageChange} placeholder="Enter a searh language" />
        <input type='text' value={stars} onChange={(e) => handleStarsChange} placeholder="Enter a search stars" />
        <button type='submit'>Search</button>
      </form>
      {results.map((repo) => (
        <div key={repo.id}>
          <a href={repo.html_url}>{repo.name}</a>
          <p>{repo.description}</p>
          <p>{repo.strangers_count} stars</p>
          <p>{repo.language}</p>
        </div>
      ))}
      {isLoading && <p>Loading...</p>}
      {hasNextPage && (<button onClick={debounceLoadMore}>Load More</button>)}
    </div>
  );
}

export default App;