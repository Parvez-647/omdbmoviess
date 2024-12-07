import axios from 'axios';
import { useEffect, useState } from 'react';
import './OmdbMovies.css';
import Loader from './Loader';

const API_KEY = 'd13216df';

function OmdbMovies() {
    const [movies, setMovies] = useState([]);
    const [search, setSearch] = useState('');
    const [searchedMovie, setSearchedMovie] = useState('mission impossible');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [suggestions, setSuggestions] = useState([]);

    const fetchMovies = async () => {
        setLoading(true);
        setError(false);

        try {
            const { data: { Search } } = await axios.get(`https://www.omdbapi.com/?s=${searchedMovie}&apikey=${API_KEY}`);
            const limitedMovies = (Search || []).slice(0, 12);
            const movieDetails = await Promise.all(
                limitedMovies.map(async (movie) => {
                    const { data } = await axios.get(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${API_KEY}`);
                    return data;
                })
            );
            setMovies(movieDetails);
        } catch (err) {
            console.error(err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const fetchSuggestions = async (query) => {
        if (!query.trim()) {
            setSuggestions([]);
            return;
        }

        try {
            const { data: { Search } } = await axios.get(`https://www.omdbapi.com/?s=${query}&apikey=${API_KEY}`);
            setSuggestions(Search || []);
        } catch (err) {
            console.error(err);
            setSuggestions([]);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (search.trim()) {
                fetchSuggestions(search);
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [search]);

    useEffect(() => {
        fetchMovies();
    }, [searchedMovie]);

    const handleSearchInput = ({ target: { value } }) => {
        setSearch(value);
    };

    const searchMovie = (movieTitle) => {
        setSearchedMovie(movieTitle || search.trim());
        setSuggestions([]);
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            searchMovie();
        }
    };

    return (
        <section className="omdb">
            {/* Header without Logo */}
            <header className="header">
                <h1 className="app-title">OmdbMovies</h1>
            </header>

            {/* Loader */}
            {loading && (
                <div className="loader-container">
                    <Loader />
                </div>
            )}

            {error && <h1 className="error">Something went wrong. Please try again later.</h1>}

            {/* Search Section */}
            <div className="search-container">
                <input
                    type="search"
                    placeholder="Search for a movie..."
                    value={search}
                    onChange={handleSearchInput}
                    onKeyPress={handleKeyPress}
                    className="search-input"
                />
                <button onClick={() => searchMovie()} className="search-button">
                    Search
                </button>
                {suggestions.length > 0 && (
                    <ul className="suggestions-list">
                        {suggestions.map((movie) => (
                            <li
                                key={movie.imdbID}
                                onClick={() => searchMovie(movie.Title)}
                                className="suggestion-item"
                            >
                                {movie.Title} ({movie.Year})
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Movies Section */}
            <div className="movie-list">
                {movies.length > 0 ? (
                    movies.map((movie) => (
                        <div key={movie.imdbID} className="movie-card">
                            <img
                                src={movie.Poster !== 'N/A' ? movie.Poster : 'images.jpeg'}
                                alt={movie.Poster !== 'N/A' ? `${movie.Title} Poster` : 'No Poster Available'}
                                className="movie-poster"
                            />
                            <h2 className="movie-title">{movie.Title}</h2>
                            <p className="movie-year">{movie.Year}</p>
                            <p className="movie-genre"><strong>Genre:</strong> {movie.Genre}</p>
                            <p className="movie-director"><strong>Director:</strong> {movie.Director}</p>
                            <p className="movie-plot"><strong>Plot:</strong> {movie.Plot}</p>
                        </div>
                    ))
                ) : !loading && !error && (
                    <h1 className="no-movie">No movies found. Try searching for another title!</h1>
                )}
            </div>
        </section>
    );
}

export default OmdbMovies;
