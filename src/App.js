import React, { Component } from 'react';
import axios from 'axios';
import './App.css';

const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = '100';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

/* const isSearched = searchTerm => item =>
	item.title.toLowerCase().includes(searchTerm.toLowerCase()); */

class App extends Component {
	state = {
		results: null,
		searchKey: '',
		searchTerm: DEFAULT_QUERY,
		error: null
	};

	needsToSearchTopStories = searchTerm => !this.state.results[searchTerm];

	onSearchChange = event => this.setState({ searchTerm: event.target.value });

	onDismiss = id => {
		const { searchKey, results } = this.state;
		const { hits, page } = results[searchKey];

		const isNotId = item => item.objectID !== id;
		const updatedHits = hits.filter(isNotId);
		this.setState(prevState => ({
			results: {
				...prevState.results,
				[searchKey]: { hits: updatedHits, page }
			}
		}));
	};

	setSearchTopStories = result => {
		const { hits, page } = result;
		const { searchKey, results } = this.state;

		const oldHits =
			results && results[searchKey] ? results[searchKey].hits : [];

		const updatedHits = [...oldHits, ...hits];

		this.setState(prevState => ({
			results: {
				...prevState.results,
				[searchKey]: { hits: updatedHits, page }
			}
		}));
	};

	fetchSearchTopStories = async (searchTerm, page = 0) => {
		try {
			const { data } = await axios(
				`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`
			);
			this.setSearchTopStories(data);
		} catch (error) {
			this.setState({ error });
		}
	};

	async componentDidMount() {
		const { searchTerm } = this.state;
		this.setState({ searchKey: searchTerm });
		this.fetchSearchTopStories(searchTerm);
	}

	onSearchSubmit = event => {
		const { searchTerm } = this.state;
		this.setState({ searchKey: searchTerm });

		if (this.needsToSearchTopStories(searchTerm)) {
			this.fetchSearchTopStories(searchTerm);
		}
		event.preventDefault();
	};

	render() {
		const { searchTerm, results, searchKey, error } = this.state;

		const page =
			(results && results[searchKey] && results[searchKey].page) || 0;

		const list =
			(results && results[searchKey] && results[searchKey].hits) || [];

		return (
			<div className="page">
				<div className="interactions">
					<Search
						value={searchTerm}
						onChange={this.onSearchChange}
						onSubmit={this.onSearchSubmit}
					>
						Search
					</Search>
				</div>
				{error ? (
					<p>Something went wrong</p>
				) : (
					<Table list={list} onDismiss={this.onDismiss} />
				)}
				<div className="interactions">
					<Button
						onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}
					>
						More
					</Button>
				</div>
			</div>
		);
	}
}

const Search = ({ children, value, onChange, onSubmit }) => (
	<form onSubmit={onSubmit}>
		<input type="text" value={value} onChange={onChange} />
		<button type="submit">{children}</button>
	</form>
);

const Table = ({ list, onDismiss }) => (
	<section className="table">
		<header className="table-row" style={{ background: '#353b48', color: "#fff"}}>
			<span style={{ width: '40%'}}>Title</span>
			<span style={{ width: '30%'}}>Author</span>
			<span style={{ width: '10%'}}>#Comments</span>
			<span style={{ width: '10%'}}>Points</span>
			<span style={{ width: '10%'}}></span>
		</header>
		{list.map(item => (
			<div key={item.objectID} className="table-row">
				<span style={{ width: '40%' }}>
					<a href={item.url}>{item.title}</a>
				</span>
				<span style={{ width: '30%' }}>{item.author}</span>
				<span style={{ width: '10%' }}>{item.num_comments}</span>
				<span style={{ width: '10%' }}>{item.points}</span>
				<span style={{ width: '10%' }}>
					<Button
						onClick={() => onDismiss(item.objectID)}
						className="button-inline"
					>
						Dismiss
					</Button>
				</span>
			</div>
		))}
	</section>
);

const Button = ({ onClick, className = '', children }) => (
	<button onClick={onClick} className={className} type="button">
		{children}
	</button>
);

export default App;
