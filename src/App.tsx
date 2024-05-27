import {useState} from 'react';
import {useQuery, QueryClient, QueryClientProvider} from '@tanstack/react-query';
import axios from 'axios';

import './App.css';

const OMDB_URL = 'https://www.omdbapi.com';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <a href='/'>
        <h1>Watch Next</h1>
      </a>
      <Movies />
    </QueryClientProvider>
  );
}

function Movies() {
  const searchParams = new URLSearchParams(document.location.search);
  const movieQuery = searchParams.get('movies') ?? undefined;
  const {data, isLoading, error} = useQuery({
    queryKey: [movieQuery],
    queryFn: async () => {
      return await axios.get(OMDB_URL, {
        params: {
          apiKey: import.meta.env.VITE_OMDB_API_KEY,
          type: 'movie',
          s: movieQuery,
        },
      });
    },
    enabled: !!movieQuery,
  });
  const movies: Array<Movie> = data?.data.Search ?? [];
  const isNoneFound = movieQuery && !isLoading && !error && movies.length < 1;

  return (
    <div>
      <form>
        <div className='row'>
          <input name='movies' defaultValue={movieQuery} />
          <button type='submit'>Search</button>
        </div>
      </form>
      {isLoading ? <Loader /> : null}
      {movies.length > 0 ? <MovieList movies={movies} /> : null}
      {isNoneFound ? <p>Nothing found for '{movieQuery}'.</p> : null}
      {error ? <p>{error.message}</p> : null}
    </div>
  );
}

function MovieList({movies}: {movies: Array<Movie>}) {
  return (
    <ol>
      {movies.map((movie) => (
        <MovieListItem key={movie.imdbID} movie={movie} />
      ))}
    </ol>
  );
}

function MovieListItem({movie}: {movie: Movie}) {
  const [viewDetails, setViewDetails] = useState(false);
  return (
    <li className='column'>
      <div className='row'>
        <img src={movie.Poster} height={200} />
        <div className='column details'>
          <h3>
            {movie.Title} ({movie.Year})
          </h3>
          <button type='button' onClick={() => setViewDetails(!viewDetails)}>
            {viewDetails ? 'Hide' : 'View'} details
          </button>
        </div>
      </div>
      <div className='row'>
        {viewDetails ? <MovieDetails id={movie.imdbID} /> : null}
      </div>
    </li>
  );
}

function MovieDetails({id}: {id: string}) {
  const {data, isLoading} = useQuery({
    queryKey: [id],
    queryFn: async () => {
      return await axios.get(OMDB_URL, {
        params: {
          apiKey: import.meta.env.VITE_OMDB_API_KEY,
          plot: 'full',
          i: id,
        },
      });
    },
  });
  if (isLoading) {
    return <Loader />;
  }
  return (
    <div>
      <p>Directed by {data?.data?.Director}</p>
      <p>Starring {data?.data?.Actors}</p>
      <p>{data?.data?.Plot}</p>
      <p>{data?.data?.Genre}</p>
      <p>{data?.data?.Runtime}</p>
      <p>{data?.data?.imdbRating}/10</p>
    </div>
  );
}

function Loader() {
  return <p className='spinner'>↻</p>;
}

type Movie = {
  Title: string;
  Poster: string;
  Year: string;
  imdbID: string;
};

export default App;
