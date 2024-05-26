import {useState} from 'react'
import {
  useQuery,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import axios from 'axios'

const OMDB_URL = 'http://www.omdbapi.com';

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <a href="/"><h1>Watch Next</h1></a>
      <Movies />
    </QueryClientProvider>
  )
}

function Movies() {
  const searchParams = new URLSearchParams(document.location.search)
  const queryParam = searchParams.get('movies') ?? undefined
  const {data, isLoading} = useQuery({
    queryKey: [queryParam],
    queryFn: async () => {
      return await axios.get(OMDB_URL, {
        params: {
          apiKey: import.meta.env.VITE_OMDB_API_KEY,
          s: queryParam,
        }
      })
    }
  })
  const movies: Array<Movie> = data?.data.Search ?? []

  return (
    <div>
      <form>
        <input name="movies" defaultValue={queryParam}/>
        <button type="submit">Search</button>
      </form>
      {isLoading ? <Loader /> : null}
      {movies.length > 0 ? <MovieList movies={movies} /> : null }
    </div>
  )
}

function MovieList({movies}: {movies: Array<Movie>}) {
  return (
    <ol>
      {movies.map(movie => <MovieListItem key={movie.imdbID} movie={movie} />)}
    </ol>
  )
}

function MovieListItem({movie}: {movie: Movie}) {
  const [viewDetails, setViewDetails] = useState(false)
  return (
    <li>
      <img src={movie.Poster} height={100}/>
      <h3>{movie.Title}</h3>
      <h3>{movie.Year}</h3>
      <button type="button" onClick={() => setViewDetails(!viewDetails)}>Details</button>
      {viewDetails ? <MovieDetails id={movie.imdbID} /> : null}
    </li>
  )
}

function MovieDetails({id}: {id: string}) {
  const {data, isLoading} = useQuery({
    queryKey: [id],
    queryFn: async () => {
      return await axios.get(OMDB_URL, {
        params: {
          apiKey: import.meta.env.VITE_OMDB_API_KEY,
          i: id,
        }
      })
    }
  })
  if (isLoading) {
    return <Loader />
  }
  return (
    <div>
      <p>Directed by {data?.data?.Director}</p>
      <p>Starring {data?.data?.Actors}</p>
      <p>{data?.data?.Plot}</p>
      <p>{data?.data?.Runtime}</p>
      <p>{data?.data?.imdbRating}/10</p>
      <p>{data?.data?.Genre}</p>
    </div>
  )
}

function Loader() {
  return <p>Loading...</p>
}

type Movie = {
  Poster: string;
  Title: string;
  Year: string;
  imdbID: string;
}

export default App;
